import React from 'react';
import { connect } from 'react-redux';
import { fetch } from '../actions/index';

class UsersListPage extends React.Component {

  componentWillMount(){
    this.props.fetch();
  }

  render() {
    return (
      <div>
        {this.props.fetchedData}
      </div>
    );
  }

}

function mapStateToProps({ fetchedData }) {
  return {
    fetchedData
  };
}

function loadData(store) {
  return store.dispatch(fetch());
}

export {loadData};
export default connect(mapStateToProps, { fetch })(UsersListPage);