import React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {Home} from "../pages/home";
import {When} from "../pages/when";
import {Navigation} from "../components/navigation";

export const LeetRouter = () => {
    return <Router>
        <Navigation/>
        <Switch>
            <Route path='/when'>
                <When/>
            </Route>
            <Route path='/'>
                <Home/>
            </Route>
        </Switch>
    </Router>
}