import { FieldBaseProps } from '@island.is/application/types'
import { FC, useState } from 'react'
import { Box } from '@island.is/island-ui/core'
import { ApplicationStatus } from '../ApplicationStatus'
import { Overview } from '../Overview'
import { ReviewConclusion } from '../ReviewConclusion'
import { Insurance } from '../Insurance'
import { ReviewCoOwnerAndOperatorRepeater } from '../ReviewCoOwnerAndOperatorRepeater'
import { CoOwnerAndOperator, ReviewState } from '../../shared'
import { getValueViaPath } from '@island.is/application/core'
import { useAuth } from '@island.is/auth/react'

export const Review: FC<FieldBaseProps> = (props) => {
  const { application } = props
  const { userInfo } = useAuth()
  const [step, setStep] = useState<ReviewState>('states')
  const [insurance, setInsurance] = useState<string | undefined>(
    getValueViaPath(application.answers, 'insurance.value', undefined),
  )
  const [coOwnersAndOperators, setCoOwnersAndOperators] = useState<
    CoOwnerAndOperator[]
  >(
    getValueViaPath(
      application.answers,
      'buyerCoOwnerAndOperator',
      [],
    ) as CoOwnerAndOperator[],
  )
  const reviewerNationalId = userInfo?.profile.nationalId || null

  const filteredCoOwnersAndOperators = coOwnersAndOperators.filter(
    ({ wasRemoved }) => wasRemoved !== 'true',
  )

  const displayScreen = (
    displayStep: ReviewState,
    reviewerNationalId: string,
  ) => {
    switch (displayStep) {
      case 'states':
        return (
          <ApplicationStatus
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            coOwnersAndOperators={filteredCoOwnersAndOperators}
            {...props}
          />
        )
      case 'overview':
        return (
          <Overview
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            insurance={insurance}
            coOwnersAndOperators={filteredCoOwnersAndOperators}
            {...props}
          />
        )
      case 'conclusion':
        return (
          <ReviewConclusion
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            coOwnersAndOperators={filteredCoOwnersAndOperators}
            {...props}
          />
        )
      case 'addPeople':
        return (
          <ReviewCoOwnerAndOperatorRepeater
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            setCoOwnersAndOperators={setCoOwnersAndOperators}
            coOwnersAndOperators={coOwnersAndOperators}
            {...props}
          />
        )
      case 'insurance':
        return (
          <Insurance
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            setInsurance={setInsurance}
            {...props}
          />
        )
      default:
        return (
          <ApplicationStatus
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            {...props}
          />
        )
    }
  }

  if (!reviewerNationalId) return null

  return <Box>{displayScreen(step, reviewerNationalId)}</Box>
}
