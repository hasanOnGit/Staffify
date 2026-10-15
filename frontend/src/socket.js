// Safe mock/optional socket client to prevent console ERR_CONNECTION_REFUSED
const socket = {
  emit: () => {},
  on: () => {},
  off: () => {},
};

export default socket;
