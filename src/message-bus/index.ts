import { withFilter } from 'graphql-yoga'
import { pubsub } from '../pub-sub'
import { gql } from 'apollo-server'

const MESSAGE_TRIGGER = 'MESSAGE_BUS_TRIGGER'
const SUBSCRIPTION_NAME = 'subscribe'

export const typeDefsMessageBus = gql`
    scalar JSON

    input PublishInput {
        type: String!
        scope: String
        payload: JSON
    }
    input SubscribeInput  {
        type: String
        scope: String
    }
    type MessagePayload {
        type: String!
        scope: String
        payload: JSON
    }
    type Mutation {
        publish(message: PublishInput): MessagePayload
    }
    type Subscription {
        ${SUBSCRIPTION_NAME}(filter: SubscribeInput): MessagePayload
    }
`

export const MessageBusMutation = {
  publish(root: any, args: any) {
    pubsub.publish(MESSAGE_TRIGGER, { [SUBSCRIPTION_NAME]: args.message })
    return args.message
  },
}

export const MessageBusSubscription = {
  [SUBSCRIPTION_NAME]: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(MESSAGE_TRIGGER),
      (payload, variables) => {
        // No filters
        if (!payload || !payload[SUBSCRIPTION_NAME] || !variables.filter) {
          return true
        }

        const { type, scope } = variables.filter

        const hasType = type && payload[SUBSCRIPTION_NAME].type === type
        const hasScope = scope && payload[SUBSCRIPTION_NAME].scope === scope

        // type AND scope
        if (type && scope) {
          return hasType && hasScope
        }

        if (!type && scope) {
          return hasScope
        }

        if (type && !scope) {
          return hasType
        }

        return true
      },
    ),
  },
}
