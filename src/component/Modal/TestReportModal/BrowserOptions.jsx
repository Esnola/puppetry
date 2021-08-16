import React from "react";
import { Checkbox, Select } from "antd";
import ErrorBoundary from "component/ErrorBoundary";
import AbstractComponent from "component/AbstractComponent";
import BrowseDirectory from "component/Global/BrowseDirectory";
import { SELECT_SEARCH_PROPS } from "service/utils";

import { ChromeExecutablePath } from "./ChromeExecutablePath";
// import { FirefoxExecutablePath } from "./FirefoxExecutablePath";
import { ChromeArguments } from "./ChromeArguments";
import { FirefoxArguments } from "./FirefoxArguments";
import { ConnectOptions } from "./ConnectOptions";
import { BrowserIntro } from "./BrowserIntro";
import { updateLauncherArgs } from "./utils";


/*eslint no-empty: 0*/
const { Option, OptGroup } = Select,
      NON_PRODUCTS = [ "headless", "chromium" , "connect" ];

function filterNullable( obj ) {
  return Object.keys( obj ).reduce( ( carry, key ) => {
    if ( obj[ key ] !== null ) {
      carry[ key ] = obj[ key ];
    }
    return carry;
  }, {});
}


export class BrowserOptions extends AbstractComponent {

  static propTypes = {

  }

  state = {
    product: "headless",
    headless: true,
    incognito: true,
    devtools: false,
    chromeExtDirectory: "",
    browseDirectoryValidateStatus: "",
    browseDirectoryValidateMessage: "",
    chromeExtLauncherArgs: ""
  }


  getLauncherArgsInstance() {
    return ( this.state.product === "firefox"
      ? this.refFirefoxArguments.current
      : this.refChromeArguments.current );
  }

  getLauncherArgs() {
    const instance = this.getLauncherArgsInstance();
    if ( instance === null ) {
      return "";
    }
    instance.save();
    const argsString = instance.state.launcherArgs;
    if ( this.state.product === "firefox" ) {
      return argsString;
    }
    // browser args + chrome extension
    return ( argsString
      + ( this.state.chromeExtLauncherArgs ? ` ${ this.state.chromeExtLauncherArgs }` : `` ) ).trim();
  }

  getExecutablePath() {
    const instance = this.state.product === "chrome"
      ? this.refChromeExecutablePath.current
      : this.refFirefoxExecutablePath.current;
    instance.save();
    return instance.state.executablePath;
  }

  getBrowserWSEndpoint() {
    const instance = this.refConnectOptions.current;
    instance.save();
    return instance.state.browserWSEndpoint;
  }

  getOptions() {
    return {
      incognito: this.state.incognito,
      "puppeteer.connect": {
        ignoreHTTPSErrors: true,
        browserWSEndpoint: this.state.product === "connect"
          ? this.getBrowserWSEndpoint()
          : null
      },
      "puppeteer.launch": filterNullable({
        product: NON_PRODUCTS.includes( this.state.product )
          ?  null
          : ( this.state.product === "_firefox" ? "firefox" : this.state.product ),
        headless: this.state.product === "_firefox" || this.state.headless,
        devtools: this.state.devtools,
        slowMo: 30,
        ignoreHTTPSErrors: this.getLauncherArgsInstance()
          ? this.getLauncherArgsInstance().state.ignoreHTTPSErrors
          : false,
        args: this.getLauncherArgs().split( " " ),
        executablePath: ( ( this.state.product === "chrome" )
          ? this.getExecutablePath()
          : null )
      })
    };
  }

  constructor( props ) {
    super( props );
    this.refChromeArguments = React.createRef();
    this.refFirefoxArguments = React.createRef();
    this.refChromeExecutablePath = React.createRef();
    this.refFirefoxExecutablePath = React.createRef();
    this.refConnectOptions = React.createRef();
  }

  onChangeCheckbox = ( checked, field ) => {
    this.setState({
      [ field ]: checked
    });
  }


  onBrowserChange = ( product ) => {
    this.setState({
      product,
      headless: product === "headless"
    });
  }

  getSelectedDirectory = ( selectedDirectory ) => {
    let launcherArgs = this.state.chromeExtLauncherArgs;
    launcherArgs = updateLauncherArgs( launcherArgs, `--disable-extensions-except=${ selectedDirectory }`, true );
    launcherArgs = updateLauncherArgs( launcherArgs, `--load-extension=${ selectedDirectory }`, true );
    this.setState({
      chromeExtLauncherArgs: launcherArgs,
      chromeExtDirectory: selectedDirectory,
      incognito: false,
      headless: false
    });
  }

  render() {
    return (
      <ErrorBoundary>

        <div className="run-in-browser__layout">

          <div className="select-group-inline">
            <span className="select-group-inline__label" title="Select a browser to run the tests">
              <img src="./assets/open-in-browser.svg"
                className="in-text-icon"
                alt="Select a browser to run the tests" width="24" height="24" />
            </span>
            <Select
              { ...SELECT_SEARCH_PROPS }
              style={{ width: 172 }}
              value={ this.state.product }
              onChange={ this.onBrowserChange }
            >
              <OptGroup label="Embedded browsers">
                <Option value="headless" key="headless">Headless Chromium</Option>
                <Option value="chromium" key="chromium">Chromium</Option>
                <Option value="_firefox" key="hfirefox">Headless Firefox</Option>
                <Option value="firefox" key="firefox">Firefox</Option>
              </OptGroup>
              <OptGroup label="External browsers">
                <Option value="chrome" key="chrome">Chrome/Edge</Option>
              </OptGroup>
              <OptGroup label="Remote control">
                <Option value="connect" key="connect">Connect to Chrome</Option>
              </OptGroup>
            </Select>
          </div>


          <div className="chromium-checkbox-group">
            { this.state.product !== "connect" ?
              <ErrorBoundary>
                { " " } <Checkbox
                  checked={ this.state.devtool }
                  onChange={ e => this.onChangeCheckbox( e.target.checked, "devtool" ) }
                >
                  DevTools
                </Checkbox>
              </ErrorBoundary> :  null }

            { " " } <Checkbox
              checked={ this.state.incognito }
              onChange={ e => this.onChangeCheckbox( e.target.checked, "incognito" ) }
            >
                  incognito window
            </Checkbox>
          </div>

        </div>

        <BrowserIntro product={ this.state.product } />


        { this.state.product === "connect" ? <ConnectOptions ref={ this.refConnectOptions } /> : null }

        { this.state.product === "chrome" ?
          <ChromeExecutablePath ref={ this.refChromeExecutablePath } /> : null }

        { [ "headless", "chromium", "chrome" ].includes( this.state.product ) ?
          <ChromeArguments ref={ this.refChromeArguments } /> : null }

        { [ "_firefox", "firefox" ].includes( this.state.product )
          ? <FirefoxArguments ref={ this.refFirefoxArguments } /> :  null }

        { [ "headless", "chromium", "chrome" ].includes( this.state.product ) ?
          <div className="browser-options-layout">
            <BrowseDirectory
              defaultDirectory={ this.state.chromeExtDirectory }
              validateStatus={ this.state.browseDirectoryValidateStatus }
              validateMessage={ this.state.browseDirectoryValidateMessage }
              getSelectedDirectory={ this.getSelectedDirectory }
              id="inBrowserOptions"
              label="Chrome extension location (optional)" />
          </div> : null }

      </ErrorBoundary>
    );
  }
}