import { buildForm } from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import { formConclusionSection } from '@island.is/application/ui-forms'
import { application } from '../lib/messages'
import { conclusion } from '../lib/messages'

export const PaymentPlanSubmittedForm: Form = buildForm({
  id: 'PaymentPlanSubmittedForm',
  title: application.name,
  mode: FormModes.COMPLETED,
  children: [
    formConclusionSection({
      alertMessage: conclusion.general.alertMessage,
      alertTitle: conclusion.general.alertTitle,
      expandableHeader: conclusion.information.title,
      expandableIntro: conclusion.information.intro,
      expandableDescription: conclusion.information.bulletList,
    }),
  ],
})
