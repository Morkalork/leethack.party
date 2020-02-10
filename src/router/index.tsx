import React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {What} from "../pages/what";
import {When} from "../pages/when";
import {Navigation} from "../components/navigation";
import {Where} from "../pages/where";
import {Why} from "../pages/why";

export const LeetRouter = () => {
    return <Router>
        <Navigation/>
        <Switch>
            <Route path='/when'>
                <When/>
            </Route>
            <Route path='/where'>
                <Where/>
            </Route>
            <Route path='/why'>
                <Why />
            </Route>
            <Route path='/'>
                <What/>
            </Route>
        </Switch>
    </Router>
}