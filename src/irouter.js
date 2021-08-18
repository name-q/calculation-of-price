import React from 'react'

import {Switch,Route,Redirect} from 'react-router-dom'

import Price from './component/price'

export const IRouter = () => (
    <Switch>
        <Route exact path='/' component={Price}/>
        
        <Redirect to="/" />
    </Switch>
)
