interface Props {
  connected: boolean
  connecting: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export const ConnectButton = ({ connected, connecting, onConnect, onDisconnect }: Props) => {
  if (!connected) return <button className="button button--primary margin-right--md" disabled={connecting} onClick={onConnect} type="button">Connect</button>

  return <>
    <button className="button button--primary margin-right--md" disabled={connecting} onClick={onDisconnect} type="button">Disconnect</button>
    <span className="text--success">Great! Now head to the "Command" tab and send some commands!</span>
  </>
}
