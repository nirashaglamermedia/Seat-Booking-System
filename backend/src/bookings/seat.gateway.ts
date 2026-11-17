import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SeatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('selectSeat')
    handleSelectSeat(
      @MessageBody() data: {
        seat_id: number;
        showtime_id: number;
        visit_date: string;
      },
    ) {
      this.server.emit('seatSelected', data);
    }

  @SubscribeMessage('unselectSeat')
    handleUnselectSeat(
      @MessageBody() data: {
        seat_id: number;
        showtime_id: number;
        visit_date: string;
      },
    ) {
      this.server.emit('seatUnselected', data);
    }
}