import React from 'react'
import ReactDOM from 'react-dom'
import Main from './Components/Main'

// Redux
import { Provider as ReduxProvider } from 'react-redux'
import { createStore } from 'redux'
import Reducer from './store/reducer'

// GraphQL
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// GraphQL Subscriptions
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

const httpLink = new HttpLink({ uri: 'http://localhost:8000/graphql' })
/*const wsLink = new WebSocketLink({
    uri: 'ws://localhost:8000/subscriptions',
    options: {
        reconnect: true
    }
})*/

const link = split( ({query}) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
},
    //wsLink,
    httpLink
)

const client = new ApolloClient({
     link: httpLink, //link,
    cache: new InMemoryCache()
})

const store = createStore(
    Reducer,
    window.devToolsExtension && window.devToolsExtension()
)

ReactDOM.render(
    <ApolloProvider client={client}>
    <ReduxProvider store={store}>
        <Main />
    </ReduxProvider>
    </ApolloProvider>,
    document.getElementById("app")
)