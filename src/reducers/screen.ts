import {AnyAction, types} from '../actions/actions'
import {ScreenState} from '../interfaces/screen'
import {BcMeta, BcMetaState} from '../interfaces/bc'
import {ObjectMap} from '../interfaces/objectMap'
import {OperationTypeCrud} from '../interfaces/operation'

const initialState: ScreenState = {
    screenName: null,
    bo: { activeBcName: null, bc: {} },
    cachedBc: {

    },
    views: [],
    primaryView: '',
    filters: {},
    sorters: {}
}

export function screen(state = initialState, action: AnyAction): ScreenState {
    switch (action.type) {
        case types.selectScreen: {
            const bcDictionary: ObjectMap<BcMeta> = {}
            action.payload.screen.meta.bo.bc.forEach(item => {
                bcDictionary[item.name] = item
            })
            return {
                ...state,
                screenName: action.payload.screen.name,
                primaryView: action.payload.screen.meta.primary,
                views: action.payload.screen.meta.views,
                bo: { activeBcName: null, bc: bcDictionary }
            }
        }
        case types.selectScreenFail: {
            return { ...state, screenName: action.payload.screenName, views: [] }
        }
        case types.bcFetchDataRequest: {
            const depth = action.payload.depth
            return { ...state,
                bo: { ...state.bo,
                    bc: { ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            ...(depth && depth > 1)
                                ? {
                                    depthBc: {
                                        ...state.bo.bc[action.payload.bcName].depthBc,
                                        [depth]: {
                                            ...(state.bo.bc[action.payload.bcName].depthBc || {})[depth],
                                            loading: true
                                        }
                                    }
                                }
                                : {
                                    loading: true
                                }
                        }
                    }
                }
            }
        }
        case types.bcLoadMore: {
            return {
                ...state,
                bo: { ...state.bo,
                    bc: { ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: state.bo.bc[action.payload.bcName].page + 1,
                            loading: true
                        }
                    }
                }
            }
        }
        case types.selectView: {
            const newBcs: Record<string, BcMetaState> = {}
            Array
                .from(
                    new Set(action.payload.widgets.map(widget => widget.bcName)) // БК которые есть на вьюхе
                )
                .filter(bcName => state.bo.bc[bcName] && state.bo.bc[bcName].page !== 1)
                .forEach((bcName) => {
                    newBcs[bcName] = {...state.bo.bc[bcName], page: 1}
                })
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        ...newBcs
                    }
                }
            }
        }
        case types.bcFetchDataSuccess: {
            const depth = action.payload.depth
            return { ...state,
                bo: { ...state.bo,
                    bc: { ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            ...(depth && depth > 1)
                                ? {
                                    depthBc: {
                                        ...state.bo.bc[action.payload.bcName].depthBc,
                                        [depth]: {
                                            ...(state.bo.bc[action.payload.bcName].depthBc || {})[depth],
                                            loading: false
                                        }
                                    }
                                }
                                : {
                                    hasNext: action.payload.hasNext,
                                    loading: false
                                }
                        }
                    }
                },
                cachedBc: {
                    ...state.cachedBc,
                    [action.payload.bcName]: action.payload.bcUrl
                }
            }
        }
        case types.bcFetchDataFail: {
            const depth = action.payload.depth
            if (Object.values(state.bo.bc).some((bc) => bc.name === action.payload.bcName)) {
                return {
                    ...state,
                    bo: {
                        ...state.bo,
                        bc: {
                            ...state.bo.bc,
                            [action.payload.bcName]: {
                                ...state.bo.bc[action.payload.bcName],
                                ...(depth && depth > 1)
                                    ? {
                                        depthBc: {
                                            ...state.bo.bc[action.payload.bcName].depthBc,
                                            [depth]: {
                                                ...(state.bo.bc[action.payload.bcName].depthBc || {})[depth],
                                                loading: false
                                            }
                                        }
                                    }
                                    : {
                                        loading: false
                                    }
                            }
                        }
                    },
                    cachedBc: {
                        ...state.cachedBc,
                        [action.payload.bcName]: action.payload.bcUrl
                    }
                }
            } else {
                return {...state}
            }
        }
        case types.sendOperation: {
            return (action.payload.operationType === OperationTypeCrud.associate)
                ? state
                : {
                    ...state,
                    bo: { ...state.bo,
                        bc: {...state.bo.bc,
                            [action.payload.bcName]: {
                                ...state.bo.bc[action.payload.bcName],
                                loading: true
                            }
                        }
                    },
                }
        }
        case types.sendOperationSuccess: {
            return {
                ...state,
                bo: { ...state.bo,
                    bc: {...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false
                        }
                    }
                },
            }
        }
        case types.bcDeleteDataFail:
        case types.sendOperationFail: {
            return {
                ...state,
                bo: { ...state.bo,
                    bc: {...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false
                        }
                    }
                },
            }
        }
        case types.bcSaveDataSuccess: {
            return {
                ...state,
                bo: { ...state.bo,
                    bc: {...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false
                        }
                    }
                },
            }
        }
        case types.bcSaveDataFail: {
            return {
                ...state,
                bo: { ...state.bo,
                    bc: {...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false
                        }
                    }
                },
            }
        }
        case types.bcNewDataSuccess: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false,
                            cursor: action.payload.dataItem.id
                        }
                    }
                },
                cachedBc: {
                    ...state.cachedBc,
                    [action.payload.bcName]: action.payload.bcUrl
                }
            }
        }
        case types.bcChangeCursors: {
            const newCursors: ObjectMap<BcMetaState> = {}
            const newCache: ObjectMap<string> = {}
            Object.entries(action.payload.cursorsMap).forEach(entry => {
                const [bcName, cursor] = entry
                newCursors[bcName] = { ...state.bo.bc[bcName], cursor }
                newCache[bcName] = cursor
            })
            // Сбросить также курсоры у всех дочерних БК от запрошенных
            const changedParents = Object.values(newCursors).map(bc => `${bc.url}/:id`)
            Object.values(state.bo.bc).forEach(bc => {
                if (changedParents.some(item => bc.url.includes(item))) {
                    newCursors[bc.name] = { ...state.bo.bc[bc.name], cursor: null }
                    newCache[bc.name] = null
                }
            })
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: { ...state.bo.bc, ...newCursors }
                },
                cachedBc: { ...state.cachedBc, ...newCache }
            }
        }
        case types.bcChangeDepthCursor: {
            const bcName = action.payload.bcName
            const depth = action.payload.depth
            const prevBc = state.bo.bc[bcName]

            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [bcName]: {
                            ...prevBc,
                            ...(depth === 1)
                                ? {
                                    cursor: action.payload.cursor
                                }
                                : {
                                    depthBc: {
                                        ...prevBc.depthBc,
                                        [depth]: {
                                            ...(prevBc.depthBc || {})[depth],
                                            cursor: action.payload.cursor
                                        }
                                    }
                                }
                        }
                    }
                }
            }
        }
        case types.bcSelectRecord: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            cursor: action.payload.cursor
                        }
                    }
                }
            }
        }
        case types.bcForceUpdate: {
            const prevBc = state.bo.bc[action.payload.bcName]
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...prevBc,
                            cursor: null,
                            loading: true
                        }
                    }
                },
                cachedBc: { ...state.cachedBc, [action.payload.bcName]: null }
            }
        }
        case types.bcAddFilter: {
            const { bcName, filter } = action.payload
            const prevFilters = state.filters[bcName] || []
            const prevFilter = prevFilters.find(item => item.fieldName === filter.fieldName && item.type === filter.type)
            const newFilters = prevFilter
                ? prevFilters.map(item => item === prevFilter
                    ? { ...prevFilter, value: filter.value }
                    : item
                )
                : [ ...prevFilters, filter ]
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [bcName]: newFilters
                }
            }
        }
        case types.bcRemoveFilter: {
            const { bcName, filter } = action.payload
            const prevFilters = state.filters[bcName] || []
            const newFilters = prevFilters.filter(item => item.fieldName !== filter.fieldName || item.type !== item.type)
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [bcName]: newFilters
                }
            }
        }
        case types.bcAddSorter: {
            return {
                ...state,
                sorters: {
                    ...state.sorters,
                    [action.payload.bcName]: [action.payload.sorter]
                }
            }
        }
        case types.bcChangePage: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: action.payload.page,
                            loading: true
                        }
                    }
                }
            }
        }
        case types.showViewPopup: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: 1,
                            loading: true
                        }
                    }
                }
            }
        }
        default:
            return state
    }
}

export default screen
