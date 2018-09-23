import React, { Component } from "react";
import { connect } from "react-redux";

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { ExampleView } from "../";

/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class ExampleContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // Component Life Cycle Functions

    // Component Functions

    render() {
        const {} = this.props;

        return <ExampleView />;
    }
}

const mapStateToProps = state => ({
    user: state.user.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    // onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleContainer);
