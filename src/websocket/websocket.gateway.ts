import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_auction')
  handleJoinAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`auction_${data.auctionId}`);
    return { message: `Joined auction ${data.auctionId}` };
  }

  @SubscribeMessage('leave_auction')
  handleLeaveAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`auction_${data.auctionId}`);
    return { message: `Left auction ${data.auctionId}` };
  }

  @SubscribeMessage('place_bid')
  handlePlaceBid(
    @MessageBody() data: { auctionId: string; amount: number; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast bid to all clients in the auction room
    this.server.to(`auction_${data.auctionId}`).emit('new_bid', {
      amount: data.amount,
      userId: data.userId,
      timestamp: new Date(),
    });
    return { message: 'Bid placed successfully' };
  }
}
