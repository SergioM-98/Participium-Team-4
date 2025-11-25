import { MessageService } from '@/services/message.service';
import { sendMessage, getReportMessages } from '@/controllers/message.controller';


jest.mock('@/services/message.service', () => {
  const mockMessageServiceInstance = {
    sendMessage: jest.fn(),
    getReportMessages: jest.fn(),
  };

  return {
    MessageService: {
      getInstance: jest.fn(() => mockMessageServiceInstance),
    },
  };
});


const mockMessageService = jest.mocked(MessageService);
const mockInstance = mockMessageService.getInstance() as jest.Mocked<{
  sendMessage: jest.MockedFunction<any>;
  getReportMessages: jest.MockedFunction<any>;
}>;

describe('MessageController story 11', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const mockRequest = {
                reportId: '1',
                senderId: '2',
                content: 'This is a test message',
            };


            mockInstance.sendMessage.mockResolvedValue({ 
                success: true, 
                data: 'Message sent successfully' 
            });

            const response = await sendMessage(
                mockRequest.content, 
                BigInt(mockRequest.senderId), 
                BigInt(mockRequest.reportId)
            );


            expect(mockMessageService.getInstance).toHaveBeenCalled();
            expect(mockInstance.sendMessage).toHaveBeenCalledWith(
                'This is a test message', 
                BigInt('2'), 
                BigInt('1')
            );
            expect(response).toEqual({ success: true, data: 'Message sent successfully' });
        });

        it('should handle message sending failure', async () => {
            const mockRequest = {
                reportId: '1',
                senderId: '2',
                content: 'This is a test message',
            };

            mockInstance.sendMessage.mockResolvedValue({ 
                success: false, 
                error: 'Failed to send message' 
            });

            const response = await sendMessage(
                mockRequest.content, 
                BigInt(mockRequest.senderId), 
                BigInt(mockRequest.reportId)
            );

            expect(mockMessageService.getInstance).toHaveBeenCalled();
            expect(mockInstance.sendMessage).toHaveBeenCalledWith(
                'This is a test message', 
                BigInt('2'), 
                BigInt('1')
            );
            
            expect(response).toEqual({ success: false, error: 'Failed to send message' });
        });
    });

    describe('getReportMessages', () => {
        it('should retrieve messages for a report successfully', async () => {
            const mockReportId = BigInt(1);
            const mockMessages = [
                { id: 'msg1', content: 'First message', senderId: '2', reportId: '1' },
                { id: 'msg2', content: 'Second message', senderId: '3', reportId: '1' },
            ];

            mockInstance.getReportMessages.mockResolvedValue({ 
                success: true, 
                data: mockMessages 
            });

            const response = await getReportMessages(mockReportId);

            expect(mockMessageService.getInstance).toHaveBeenCalled();
            expect(mockInstance.getReportMessages).toHaveBeenCalledWith(BigInt(1));
            expect(response).toEqual({ success: true, data: mockMessages });
        });

        it('should handle failure to retrieve messages for a report', async () => {
            const mockReportId = BigInt(1);
            
            mockInstance.getReportMessages.mockResolvedValue({ 
                success: false, 
                error: 'Failed to retrieve messages' 
            });

            const response = await getReportMessages(mockReportId);

            expect(mockMessageService.getInstance).toHaveBeenCalled();
            expect(mockInstance.getReportMessages).toHaveBeenCalledWith(BigInt(1));
            expect(response).toEqual({ success: false, error: 'Failed to retrieve messages' });
        });
    });
});