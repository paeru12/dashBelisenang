export function getDeviceId() {

  let id = localStorage.getItem("scanner_device_id");

  if (!id) {

    id = crypto.randomUUID();

    localStorage.setItem("scanner_device_id", id);

  }

  return id;

}
