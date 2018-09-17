import { GraphQLServer } from 'graphql-yoga'
import { gql } from 'apollo-server'
import { pubsub } from './pub-sub'
import { typeDefsMessageBus, MessageBusMutation, MessageBusSubscription } from './message-bus'

const typeDefs = gql`
    ${typeDefsMessageBus}
`

const resolvers = {
  Mutation: {
    ...MessageBusMutation,
  },
  Subscription: {
    ...MessageBusSubscription,
  },
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})

server.start(() => console.log('Server is running on http://localhost:4000'))

pubsub.subscribe('MESSAGE', (args) => {
  console.log('', ...args)
})
