import uuidv4 from 'uuid/v4'
import userResolvers from './user'
import arenaResolvers from './arena'
import tableResolvers from './table'
import policyResolvers from './policy'
import calcTableResolvers from './calctable'

export default [policyResolvers,tableResolvers,calcTableResolvers,arenaResolvers]
