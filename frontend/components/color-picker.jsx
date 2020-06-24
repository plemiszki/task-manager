import React from 'react'

export default class ColorPicker extends React.Component {

  constructor(props) {
    super(props);
  }

  pickColor(e) {
    let style = e.target.getAttribute('style');
    let color = style.split('(')[1].slice(0, -2);
    this.props.func(color);
  }

  render() {
    return(
      <div className="color-picker">
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(234, 30, 30)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(255, 175, 163)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(255, 175, 36)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(238, 244, 66)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(92, 184, 92)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(111, 138, 240)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(181, 111, 240)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(175, 96, 26)' } }></div>
        <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(210, 206, 200)' } }></div>
      </div>
    );
  }
}
