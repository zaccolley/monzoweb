import React from 'react';
import Container from 'components/Container';
import localForage from 'localforage';
import { checkStatus, showErrorMessage } from 'lib/utils';
import 'whatwg-fetch';

// Component states

const COMP_LOADING = (
  <div>
    <div className="progress" style={{marginTop: '5vh'}}>
        <div className="indeterminate"></div>
    </div>
    <h5 className="center">Please wait while we authenticate your details</h5>
  </div>
);

const COMP_NO_CODE = (
  <div className="card-panel red lighten-3" style={{marginTop: '5vh'}}>
    No authorization code found. Make sure the URL has something like 'code=12345678910' in it.
  </div>
);

const COMP_AJAX_ERROR = (
  <div className="card-panel red lighten-3" style={{marginTop: '5vh'}}>
    Internal error - looks like that authorisation code isn't working. If this keeps happening <a href="https://github.com/robcalcroft/monzoweb/issues">let me know</a>.
  </div>
);

export default class Callback extends React.Component {
  constructor() {
    super();

    this.state = {
      component: COMP_LOADING
    };
  }

  componentDidMount() {
    const queryString = window.location.search.replace('?', '').split('&').map(string => {
      let query = {};
      const queryString = string.split(/^[A-Za-z0-9]+=/);
      query[queryString[0]] = queryString[1];
      return query;
    });

    const code = queryString.find(query => !!query.code);

    if (!code || !code.code) {
      return this.setState({
        component: COMP_NO_CODE
      });
    }

    fetch(`/token?code=${code.code}`)
      .then(checkStatus)
      .then(response => response.json())
      .then(body => {

        // if (body.access_token && body.refresh_token) {
        //   Promise.all([
        //     localForage.setItem('monzo_access_token', body.access_token),
        //     localForage.setItem('monzo_refresh_token', body.refresh_token)
        //   ]).then(() => {
        //     window.location.href = '/accounts';
        //   });
        // }
        localStorage.setItem('monzo_access_token', body.access_token);
        localStorage.setItem('monzo_refresh_token', body.refresh_token);
        window.location.href = '/accounts';
      })
      .catch(error => {
        showErrorMessage(error);

        return this.setState({
          component: COMP_AJAX_ERROR
        });
      });
  }

  render() {
    return (
      <Container nav={false}>
        {this.state.component}
      </Container>
    );
  }
}
