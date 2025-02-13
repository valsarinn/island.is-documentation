import { buildForm } from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import { overview } from '../lib/messages'
import { formConclusionSection } from '@island.is/application/ui-forms'

export const overviewForm: Form = buildForm({
  id: 'OverviewForm',
  title: overview.sectionTitle,
  mode: FormModes.COMPLETED,
  children: [
    formConclusionSection({
      alertMessage: overview.alertMessage,
      alertTitle: overview.alertTitle,
      expandableDescription: overview.expandableDescription,
      expandableHeader: overview.expandeableHeader,
      expandableIntro: overview.expandableIntro,
    }),
  ],
})
