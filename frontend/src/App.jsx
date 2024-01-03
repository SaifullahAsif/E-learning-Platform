import { useState } from 'react'
import './App.css'
import { BrowserRouter, Switch, Route } from "react-router-dom";


function App() {

  return (
    <>
      <BrowserRouter basename={"/"}>
          <Switch>
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/`}
              component={HomePage}
            />
            </Switch>
      </BrowserRouter>
    </>
  )
}

export default App
