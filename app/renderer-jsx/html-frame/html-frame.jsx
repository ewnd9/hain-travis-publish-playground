'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

class HTMLFrame extends React.Component {
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
    return (
      <iframe {...this.props} />
    );
  }
}


module.exports = HTMLFrame;
