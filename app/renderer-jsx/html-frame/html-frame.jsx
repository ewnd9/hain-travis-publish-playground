'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

class HTMLFrame extends React.Component {
  constructor() {
    super();
    this.counter = 0;
  }

  componentDidMount() {
    this.renderHtml();
  }

  componentDidUpdate() {
    this.renderHtml();
  }

  renderHtml() {
    const html = this.props.html || '<!doctype html><html></html>';
    const doc = ReactDOM.findDOMNode(this).contentDocument;
    if (doc && doc.readyState === 'complete') {
      doc.clear();
      doc.open();
      doc.write(html);
      doc.close();
    } else {
      setTimeout(this.renderHtml, 5);
    }
  }

  render() {
    this.counter += 1;
    if (this.counter > 10000)
      this.counter = 0;
    return (
      <iframe key={this.counter} {...this.props} />
    );
  }
}


module.exports = HTMLFrame;
