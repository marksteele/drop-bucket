import React, { Component } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";


import "./Home.css";
import MyFiles from "./MyFiles";
import MySharedFiles from "./MySharedFiles";
import SharedWithMe from "./SharedWithMe";
import NewFile from "./NewFile";

//window.LOG_LEVEL = 'DEBUG';

export default class Home extends Component {

  render() {
    return (
      <>
      <div className="Home">
        <Tabs>
    <TabList>
      <Tab>My files</Tab>
      <Tab>My shared files</Tab>
      <Tab>Shared with me</Tab>
      <Tab>Upload new files</Tab>
    </TabList>

    <TabPanel>
      <MyFiles />
    </TabPanel>
    <TabPanel>
      <MySharedFiles />
    </TabPanel>
    <TabPanel>
      <SharedWithMe />
    </TabPanel>
    <TabPanel>
    <NewFile />
    </TabPanel>

  </Tabs>
        
      </div>
      </>
    );
  }
}
