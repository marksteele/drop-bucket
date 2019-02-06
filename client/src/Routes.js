import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NewFile from "./containers/NewFile";
import NotFound from "./containers/NotFound";

export default () =>
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/files/new" exact component={NewFile} />
    <Route component={NotFound} />
  </Switch>;
