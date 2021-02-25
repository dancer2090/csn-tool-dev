import React, { PureComponent } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    zIndex: 401,
    transform: 'translate(-50%, -50%)',
    padding: '10px 20px'
  }
};

class ModalPopup extends PureComponent {
  constructor(props) {
    super(props);
    const { show = false } = this.props;
    this.state = {
      modalIsOpen: show
    };
  }

  renderDefaultContent(title, description) {
    return (
      <div className="modal-content">
        <h3 className="modal-title">
          {title}
        </h3>
        <div className="modal-description">
          {description}
        </div>
      </div>
    );
  }

  render() {
    const { children, title, description } = this.props;
    return (
      <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {
            children
              ? { children }
              : this.renderDefaultContent(title, description)
          }
        </Modal>
      </div>
    );
  }
}

export default ModalPopup;
