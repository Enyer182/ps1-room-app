import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { DEFAULT_BIOS_URL, DEFAULT_GAME_ID, GAMES } from '../constants/games'
import type { CoreOverride, Ps1Game, ViewMode } from '../types/emulator'

const ROM_EXT_PRIORITY = ['.chd', '.pbp', '.iso', '.ccd', '.bin', '.img']
const EXTERNAL_FILES_STORAGE_PREFIX = 'nostalgia:external-files:'
const LOCAL_ROM_ROUTE_PREFIX = '/__localrom__'

type SessionState = {
  selectedGameId: string
  customGame?: Ps1Game
  biosUrl: string
  tvPoweredOn: boolean
  bootToken: number
  overrideCore: CoreOverride
  viewMode: ViewMode
  romLoadHint: string
}

type SessionAction =
  | { type: 'set_selected_game'; selectedGameId: string }
  | { type: 'set_custom_game'; customGame?: Ps1Game }
  | { type: 'set_bios_url'; biosUrl: string }
  | { type: 'set_override_core'; overrideCore: CoreOverride }
  | { type: 'set_view_mode'; viewMode: ViewMode }
  | { type: 'set_rom_hint'; romLoadHint: string }
  | { type: 'power_on_or_restart' }
  | { type: 'power_off' }

type CueBundleResult =
  | {
      ok: true
      cueBlobUrl: string
      dataBlobUrls: string[]
      externalFilesToken: string
      title: string
      hint: string
      entryFileName: string
    }
  | {
      ok: false
      reason: string
    }

const initialState: SessionState = {
  selectedGameId: DEFAULT_GAME_ID,
  customGame: undefined,
  biosUrl: DEFAULT_BIOS_URL,
  tvPoweredOn: false,
  bootToken: 0,
  overrideCore: 'auto',
  viewMode: 'observer',
  romLoadHint: '',
}

function shouldIncrementBoot(state: SessionState) {
  return state.tvPoweredOn ? state.bootToken + 1 : state.bootToken
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'set_selected_game': {
      if (state.selectedGameId === action.selectedGameId) {
        return state
      }
      return {
        ...state,
        selectedGameId: action.selectedGameId,
        bootToken: shouldIncrementBoot(state),
      }
    }
    case 'set_custom_game': {
      const shouldRestart = state.tvPoweredOn && state.selectedGameId === 'custom'
      return {
        ...state,
        customGame: action.customGame,
        bootToken: shouldRestart ? state.bootToken + 1 : state.bootToken,
      }
    }
    case 'set_bios_url': {
      if (state.biosUrl === action.biosUrl) {
        return state
      }
      return {
        ...state,
        biosUrl: action.biosUrl,
        bootToken: shouldIncrementBoot(state),
      }
    }
    case 'set_override_core': {
      if (state.overrideCore === action.overrideCore) {
        return state
      }
      return {
        ...state,
        overrideCore: action.overrideCore,
        bootToken: shouldIncrementBoot(state),
      }
    }
    case 'set_view_mode':
      return {
        ...state,
        viewMode: action.viewMode,
      }
    case 'set_rom_hint':
      return {
        ...state,
        romLoadHint: action.romLoadHint,
      }
    case 'power_on_or_restart':
      return {
        ...state,
        tvPoweredOn: true,
        bootToken: state.bootToken + 1,
      }
    case 'power_off':
      return {
        ...state,
        tvPoweredOn: false,
      }
    default:
      return state
  }
}

function getFileExtension(fileName: string) {
  return fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
}

function getFileNameBase(fileName: string) {
  const normalized = fileName.replace(/\\/g, '/')
  const parts = normalized.split('/')
  return parts[parts.length - 1]
}

function revokeBlobUrl(blobUrl: string | null | undefined) {
  if (blobUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl)
  }
}

function revokeBlobUrls(blobUrls: string[]) {
  blobUrls.forEach((blobUrl) => revokeBlobUrl(blobUrl))
}

function makeStorageKey(externalFilesToken: string) {
  return `${EXTERNAL_FILES_STORAGE_PREFIX}${externalFilesToken}`
}

function clearStoredExternalFiles(externalFilesToken: string | null) {
  if (!externalFilesToken) {
    return
  }
  sessionStorage.removeItem(makeStorageKey(externalFilesToken))
}

function persistExternalFilesMap(externalFilesMap: Record<string, string>) {
  const externalFilesToken =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  sessionStorage.setItem(makeStorageKey(externalFilesToken), JSON.stringify(externalFilesMap))
  return externalFilesToken
}

async function buildCueBundle(files: File[], cueFile: File): Promise<CueBundleResult> {
  const cueText = await cueFile.text()
  const cueFileLineRegex = /^FILE\s+"([^"]+)"\s+([A-Za-z0-9_]+)\s*$/gim
  const filesByName = new Map<string, File>(
    files.map((file) => [getFileNameBase(file.name).toLowerCase(), file]),
  )
  const usedDataFiles = new Set<File>()
  const targetNameByFile = new Map<File, string>()
  const missingReferences = new Set<string>()

  const rewrittenCue = cueText.replace(cueFileLineRegex, (_, referencedPath: string, fileType: string) => {
    const referencedBase = getFileNameBase(referencedPath).toLowerCase()
    const matchedFile = filesByName.get(referencedBase)
    if (!matchedFile) {
      missingReferences.add(referencedPath)
      return `FILE "${referencedPath}" ${fileType}`
    }

    usedDataFiles.add(matchedFile)
    const cleanName = matchedFile.name.replace(/"/g, '')
    targetNameByFile.set(matchedFile, cleanName)
    return `FILE "${cleanName}" ${fileType}`
  })

  if (missingReferences.size > 0) {
    return {
      ok: false,
      reason: `Faltan archivos referenciados en .cue: ${Array.from(missingReferences).join(', ')}`,
    }
  }

  if (usedDataFiles.size === 0) {
    return {
      ok: false,
      reason: 'El .cue no contiene tracks FILE validos.',
    }
  }

  const cueBlobUrl = URL.createObjectURL(new Blob([rewrittenCue], { type: 'text/plain' }))
  const dataBlobUrls: string[] = []
  const externalFilesMap: Record<string, string> = {
    [cueFile.name.replace(/"/g, '')]: cueBlobUrl,
  }

  usedDataFiles.forEach((dataFile) => {
    const dataBlobUrl = URL.createObjectURL(dataFile)
    dataBlobUrls.push(dataBlobUrl)
    const targetName = (targetNameByFile.get(dataFile) ?? dataFile.name).replace(/"/g, '')
    externalFilesMap[targetName] = dataBlobUrl
  })

  try {
    const externalFilesToken = persistExternalFilesMap(externalFilesMap)
    return {
      ok: true,
      cueBlobUrl,
      dataBlobUrls,
      externalFilesToken,
      title: cueFile.name,
      hint: `Cargado set CUE/BIN: ${cueFile.name} (${usedDataFiles.size} track file/s).`,
      entryFileName: cueFile.name.replace(/"/g, ''),
    }
  } catch {
    revokeBlobUrl(cueBlobUrl)
    revokeBlobUrls(dataBlobUrls)
    return {
      ok: false,
      reason: 'No se pudo preparar el set multiarchivo en sessionStorage.',
    }
  }
}

export function useEmulatorSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState)
  const customRomBlobUrlsRef = useRef<string[]>([])
  const customRomExternalFilesTokenRef = useRef<string | null>(null)
  const customBiosBlobRef = useRef<string | null>(null)

  const replaceCustomRomArtifacts = useCallback((blobUrls: string[], externalFilesToken: string | null) => {
    revokeBlobUrls(customRomBlobUrlsRef.current)
    clearStoredExternalFiles(customRomExternalFilesTokenRef.current)
    customRomBlobUrlsRef.current = blobUrls
    customRomExternalFilesTokenRef.current = externalFilesToken
  }, [])

  const games = useMemo(() => (state.customGame ? [...GAMES, state.customGame] : GAMES), [state.customGame])

  const selectedGame = useMemo(
    () => games.find((game) => game.id === state.selectedGameId) ?? games[0],
    [games, state.selectedGameId],
  )

  const effectiveGame = useMemo(
    () =>
      state.overrideCore === 'auto'
        ? selectedGame
        : {
            ...selectedGame,
            core: state.overrideCore,
          },
    [state.overrideCore, selectedGame],
  )

  const setSelectedGameId = useCallback((selectedGameId: string) => {
    dispatch({ type: 'set_selected_game', selectedGameId })
  }, [])

  const setOverrideCore = useCallback((overrideCore: CoreOverride) => {
    dispatch({ type: 'set_override_core', overrideCore })
  }, [])

  const setViewMode = useCallback((viewMode: ViewMode) => {
    dispatch({ type: 'set_view_mode', viewMode })
  }, [])

  const powerOnOrRestartTv = useCallback(() => {
    dispatch({ type: 'power_on_or_restart' })
  }, [])

  const powerOffTv = useCallback(() => {
    dispatch({ type: 'power_off' })
  }, [])

  const loadRomFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return
      }

      const cueFile = files.find((file) => getFileExtension(file.name) === '.cue')
      if (cueFile) {
        const cueBundle = await buildCueBundle(files, cueFile)
        if (cueBundle.ok) {
          replaceCustomRomArtifacts(
            [cueBundle.cueBlobUrl, ...cueBundle.dataBlobUrls],
            cueBundle.externalFilesToken,
          )
          dispatch({ type: 'set_rom_hint', romLoadHint: cueBundle.hint })
          dispatch({
            type: 'set_custom_game',
            customGame: {
              id: 'custom',
              title: `Custom: ${cueBundle.title}`,
              romPath: `${LOCAL_ROM_ROUTE_PREFIX}/${cueBundle.externalFilesToken}/${encodeURIComponent(cueBundle.entryFileName)}`,
              description: 'User-provided multi-file CUE set loaded from local files.',
              sourceUrl: 'local-file',
              core: 'psx',
            },
          })
          dispatch({ type: 'set_selected_game', selectedGameId: 'custom' })
          return
        }

        dispatch({
          type: 'set_rom_hint',
          romLoadHint: `${cueBundle.reason} Intentando cargar archivo principal directo...`,
        })
      }

      const selectedFile =
        ROM_EXT_PRIORITY
          .map((ext) => files.find((file) => getFileExtension(file.name) === ext))
          .find((file): file is File => Boolean(file)) ?? files[0]

      const selectedExtension = getFileExtension(selectedFile.name)
      if (selectedExtension === '.cue') {
        dispatch({
          type: 'set_rom_hint',
          romLoadHint:
            'Se detecto solo .cue. Selecciona tambien los .bin/.img asociados o usa una version .chd/.iso.',
        })
        return
      }

      const blobUrl = URL.createObjectURL(selectedFile)
      replaceCustomRomArtifacts([blobUrl], null)
      dispatch({
        type: 'set_rom_hint',
        romLoadHint: `Cargado: ${selectedFile.name}`,
      })
      dispatch({
        type: 'set_custom_game',
        customGame: {
          id: 'custom',
          title: `Custom: ${selectedFile.name}`,
          romPath: blobUrl,
          description: 'User-provided ROM loaded from local file.',
          sourceUrl: 'local-file',
          core: 'psx',
        },
      })
      dispatch({ type: 'set_selected_game', selectedGameId: 'custom' })
    },
    [replaceCustomRomArtifacts],
  )

  const loadBiosFile = useCallback((file: File | undefined) => {
    if (!file) {
      return
    }
    const blobUrl = URL.createObjectURL(file)
    revokeBlobUrl(customBiosBlobRef.current)
    customBiosBlobRef.current = blobUrl
    dispatch({ type: 'set_bios_url', biosUrl: blobUrl })
  }, [])

  const toggleDefaultBios = useCallback(() => {
    revokeBlobUrl(customBiosBlobRef.current)
    customBiosBlobRef.current = null
    dispatch({
      type: 'set_bios_url',
      biosUrl: state.biosUrl === DEFAULT_BIOS_URL ? '' : DEFAULT_BIOS_URL,
    })
  }, [state.biosUrl])

  useEffect(() => {
    return () => {
      revokeBlobUrls(customRomBlobUrlsRef.current)
      clearStoredExternalFiles(customRomExternalFilesTokenRef.current)
      revokeBlobUrl(customBiosBlobRef.current)
    }
  }, [])

  return {
    biosUrl: state.biosUrl,
    bootToken: state.bootToken,
    effectiveGame,
    games,
    overrideCore: state.overrideCore,
    romLoadHint: state.romLoadHint,
    selectedGame,
    selectedGameId: state.selectedGameId,
    tvPoweredOn: state.tvPoweredOn,
    viewMode: state.viewMode,
    loadBiosFile,
    loadRomFiles,
    powerOffTv,
    powerOnOrRestartTv,
    setOverrideCore,
    setSelectedGameId,
    setViewMode,
    toggleDefaultBios,
  }
}
