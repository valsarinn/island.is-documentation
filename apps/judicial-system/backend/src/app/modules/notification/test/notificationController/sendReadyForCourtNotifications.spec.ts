import { uuid } from 'uuidv4'

import {
  CaseState,
  NotificationType,
  User,
} from '@island.is/judicial-system/types'
import { MessageService, MessageType } from '@island.is/judicial-system/message'

import { Case } from '../../../case'
import { SendNotificationResponse } from '../../models/sendNotification.response'
import { createTestingNotificationModule } from '../createTestingNotificationModule'

interface Then {
  result: SendNotificationResponse
  error: Error
}

type GivenWhenThen = (theCase: Case) => Promise<Then>

describe('NotificationController - Send ready for court notification', () => {
  const userId = uuid()
  const user = { id: userId } as User

  let mockMessageService: MessageService
  let givenWhenThen: GivenWhenThen

  beforeEach(async () => {
    const {
      messageService,
      notificationController,
    } = await createTestingNotificationModule()

    mockMessageService = messageService

    const mockSendMessagesToQueue = messageService.sendMessagesToQueue as jest.Mock
    mockSendMessagesToQueue.mockResolvedValue(undefined)

    givenWhenThen = async (theCase) => {
      const then = {} as Then

      await notificationController
        .sendCaseNotification(theCase.id, user, theCase, {
          type: NotificationType.READY_FOR_COURT,
        })
        .then((result) => (then.result = result))
        .catch((error) => (then.error = error))

      return then
    }
  })

  describe('message queued', () => {
    const caseId = uuid()
    let then: Then

    beforeEach(async () => {
      then = await givenWhenThen({ id: caseId } as Case)
    })

    it('should send message to queue', () => {
      expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith([
        {
          type: MessageType.SEND_READY_FOR_COURT_NOTIFICATION,
          userId,
          caseId,
        },
      ])
      expect(then.result).toEqual({ notificationSent: true })
    })
  })

  describe('messages queued for received case', () => {
    const caseId = uuid()
    let then: Then

    beforeEach(async () => {
      then = await givenWhenThen({
        id: caseId,
        state: CaseState.RECEIVED,
      } as Case)
    })

    it('should send messages to queue', () => {
      expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith([
        {
          type: MessageType.SEND_READY_FOR_COURT_NOTIFICATION,
          userId,
          caseId,
        },
        { type: MessageType.DELIVER_REQUEST_TO_COURT, userId, caseId },
      ])
      expect(then.result).toEqual({ notificationSent: true })
    })
  })
})
