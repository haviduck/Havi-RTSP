import net from "node:net";

// net.Socket already satisfies the transport contract.
export function tcpConnect({ host, port }) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port }, () => {
      socket.off("error", reject);
      resolve(socket);
    });
    socket.setNoDelay(true);
    socket.once("error", reject);
  });
}
