// Types
export * from './types'

// Implementations
export * as frame from './frame'
export * as aspect from './aspect'
export * as macro from './macro'
export * as language from './language'
export * as program from './program'

import * as frame from './frame'
import * as aspect from './aspect'
import * as macro from './macro'
import * as language from './language'
import * as program from './program'

export default { ...frame, ...aspect, ...macro, ...language, ...program }
