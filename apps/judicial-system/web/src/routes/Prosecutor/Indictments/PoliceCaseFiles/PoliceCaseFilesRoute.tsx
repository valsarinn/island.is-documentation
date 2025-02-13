import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import router from 'next/router'
import { useIntl } from 'react-intl'
import { uuid } from 'uuidv4'
import _isEqual from 'lodash/isEqual'

import {
  FormContentContainer,
  FormContext,
  FormFooter,
  InfoBox,
  PageHeader,
  PageLayout,
  PageTitle,
  ProsecutorCaseInfo,
  SectionHeading,
} from '@island.is/judicial-system-web/src/components'
import {
  IndictmentsProsecutorSubsections,
  Sections,
} from '@island.is/judicial-system-web/src/types'
import {
  titles,
  errors as errorMessages,
} from '@island.is/judicial-system-web/messages'
import {
  Box,
  InputFileUpload,
  toast,
  UploadFile,
} from '@island.is/island-ui/core'
import {
  CaseFile,
  CaseFileCategory,
  CrimeSceneMap,
  IndictmentSubtypeMap,
} from '@island.is/judicial-system/types'
import { useS3Upload } from '@island.is/judicial-system-web/src/utils/hooks'
import IndictmentInfo from '@island.is/judicial-system-web/src/components/IndictmentInfo/IndictmentInfo'
import { mapCaseFileToUploadFile } from '@island.is/judicial-system-web/src/utils/formHelper'
import * as constants from '@island.is/judicial-system/consts'

import { policeCaseFiles as m } from './PoliceCaseFilesRoute.strings'

const UploadFilesToPoliceCase: React.FC<{
  caseId: string
  policeCaseNumber: string
  setAllUploaded: (allUploaded: boolean) => void
  caseFiles: CaseFile[]
}> = ({ caseId, policeCaseNumber, setAllUploaded, caseFiles }) => {
  const { formatMessage } = useIntl()
  const { upload, remove } = useS3Upload(caseId)

  const [displayFiles, setDisplayFiles] = useState<UploadFile[]>(
    caseFiles.map(mapCaseFileToUploadFile),
  )

  const errorMessage = useMemo(() => {
    if (displayFiles.some((file) => file.status === 'error')) {
      return formatMessage(errorMessages.general)
    } else {
      return undefined
    }
  }, [displayFiles, formatMessage])

  useEffect(() => {
    setDisplayFiles(caseFiles.map(mapCaseFileToUploadFile))
  }, [caseFiles, setDisplayFiles])

  useEffect(() => {
    const isUploading = displayFiles.some((file) => file.status === 'uploading')
    setAllUploaded(!isUploading)
  }, [setAllUploaded, displayFiles])

  const setSingleFile = useCallback(
    (displayFile: UploadFile, newId?: string) => {
      setDisplayFiles((previous) => {
        const index = previous.findIndex((f) => f.id === displayFile.id)
        if (index === -1) {
          return previous
        }
        const next = [...previous]
        next[index] = { ...displayFile, id: newId ?? displayFile.id }
        return next
      })
    },
    [setDisplayFiles],
  )

  const onChange = useCallback(
    (files: File[]) => {
      // We generate an id for each file so that we find the file again when
      // updating the file's progress and onRetry.
      // Also we cannot spread File since it contains read-only properties.
      const filesWithId: Array<[File, string]> = files.map((file) => [
        file,
        `${file.name}-${uuid()}`,
      ])
      setDisplayFiles((previous) => [
        ...filesWithId.map(
          ([file, id]): UploadFile => ({
            status: 'uploading',
            percent: 1,
            name: file.name,
            id: id,
            type: file.type,
          }),
        ),
        ...previous,
      ])
      upload(
        filesWithId,
        setSingleFile,
        CaseFileCategory.CASE_FILE,
        policeCaseNumber,
      )
    },
    [upload, setSingleFile, policeCaseNumber],
  )

  const onRetry = useCallback(
    (file: UploadFile) => {
      setSingleFile({
        name: file.name,
        id: file.id,
        percent: 1,
        status: 'uploading',
        type: file.type,
      })
      upload(
        [
          [
            { name: file.name, type: file.type ?? '' } as File,
            file.id ?? file.name,
          ],
        ],
        setSingleFile,
        CaseFileCategory.CASE_FILE,
        policeCaseNumber,
      )
    },
    [setSingleFile, upload, policeCaseNumber],
  )

  const onRemove = useCallback(
    async (file: UploadFile) => {
      try {
        if (file.id) {
          const response = await remove(file.id)
          if (!response.data?.deleteFile.success) {
            throw new Error(`Failed to delete file: ${file.id}`)
          }

          setDisplayFiles((previous) => {
            return previous.filter((f) => f.id !== file.id)
          })
        }
      } catch (e) {
        toast.error(formatMessage(errorMessages.failedDeleteFile))
      }
    },
    [remove, setDisplayFiles, formatMessage],
  )

  return (
    <InputFileUpload
      name="fileUpload"
      fileList={displayFiles}
      accept="application/pdf"
      header={formatMessage(m.inputFileUpload.header)}
      description={formatMessage(m.inputFileUpload.description)}
      buttonLabel={formatMessage(m.inputFileUpload.buttonLabel)}
      onChange={onChange}
      onRemove={onRemove}
      onRetry={onRetry}
      errorMessage={errorMessage}
      showFileSize
    />
  )
}

type allUploadedState = {
  [policeCaseNumber: string]: boolean
}

/* We need to make sure this list is not rerenderd unless the props are changing.
 * Since we passing `setAllUploaded` to the children and they are calling it within a useEffect
 * causing a endless rendering loop.
 */
const PoliceUploadListMemo: React.FC<{
  caseId: string
  policeCaseNumbers: string[]
  subtypes?: IndictmentSubtypeMap
  crimeScenes?: CrimeSceneMap
  caseFiles?: CaseFile[]
  setAllUploaded: (policeCaseNumber: string) => (value: boolean) => void
}> = memo(
  ({
    caseId,
    policeCaseNumbers,
    subtypes,
    crimeScenes,
    caseFiles,
    setAllUploaded,
  }) => {
    const { formatMessage } = useIntl()
    return (
      <Box paddingBottom={4}>
        {policeCaseNumbers.map((policeCaseNumber, index) => (
          <Box key={index} marginBottom={6}>
            <SectionHeading
              title={formatMessage(m.policeCaseNumberSectionHeading, {
                policeCaseNumber,
              })}
              marginBottom={2}
            />
            <Box marginBottom={3}>
              <IndictmentInfo
                policeCaseNumber={policeCaseNumber}
                subtypes={subtypes}
                crimeScenes={crimeScenes}
              />
            </Box>
            <UploadFilesToPoliceCase
              caseId={caseId}
              caseFiles={
                caseFiles?.filter(
                  (file) => file.policeCaseNumber === policeCaseNumber,
                ) ?? []
              }
              policeCaseNumber={policeCaseNumber}
              setAllUploaded={setAllUploaded(policeCaseNumber)}
            />
          </Box>
        ))}
      </Box>
    )
  },
)

const PoliceCaseFilesRoute = () => {
  const { formatMessage } = useIntl()
  const { workingCase, isLoadingWorkingCase, caseNotFound } = useContext(
    FormContext,
  )

  const [allUploaded, setAllUploaded] = useState<allUploadedState>(
    workingCase.policeCaseNumbers.reduce(
      (acc, policeCaseNumber) => ({ ...acc, [policeCaseNumber]: true }),
      {},
    ),
  )

  useEffect(() => {
    if (!_isEqual(workingCase.policeCaseNumbers, Object.keys(allUploaded))) {
      setAllUploaded(
        workingCase.policeCaseNumbers.reduce(
          (acc, policeCaseNumber) => ({
            ...acc,
            [policeCaseNumber]:
              allUploaded[policeCaseNumber] === undefined
                ? true
                : allUploaded[policeCaseNumber],
          }),
          {},
        ),
      )
    }
  }, [allUploaded, workingCase.policeCaseNumbers])

  const setAllUploadedForPoliceCaseNumber = useCallback(
    (number: string) => (value: boolean) => {
      setAllUploaded((previous) => ({ ...previous, [number]: value }))
    },
    [setAllUploaded],
  )

  const stepIsValid = !Object.values(allUploaded).some((v) => !v)
  const handleNavigationTo = useCallback(
    (destination: string) => router.push(`${destination}/${workingCase.id}`),
    [workingCase.id],
  )

  return (
    <PageLayout
      workingCase={workingCase}
      activeSection={Sections.PROSECUTOR}
      activeSubSection={IndictmentsProsecutorSubsections.POLICE_CASE_FILES}
      isLoading={isLoadingWorkingCase}
      notFound={caseNotFound}
      isValid={stepIsValid}
      onNavigationTo={handleNavigationTo}
    >
      <PageHeader
        title={formatMessage(titles.prosecutor.indictments.policeCaseFiles)}
      />
      <FormContentContainer>
        <PageTitle>{formatMessage(m.heading)}</PageTitle>
        <ProsecutorCaseInfo workingCase={workingCase} />
        <Box marginBottom={5}>
          <InfoBox text={formatMessage(m.infoBox)}></InfoBox>
        </Box>
        <PoliceUploadListMemo
          caseId={workingCase.id}
          caseFiles={workingCase.caseFiles}
          subtypes={workingCase.indictmentSubtypes}
          crimeScenes={workingCase.crimeScenes}
          setAllUploaded={setAllUploadedForPoliceCaseNumber}
          policeCaseNumbers={workingCase.policeCaseNumbers}
        />
      </FormContentContainer>
      <FormContentContainer isFooter>
        <FormFooter
          previousUrl={`${constants.INDICTMENTS_DEFENDANT_ROUTE}/${workingCase.id}`}
          onNextButtonClick={() =>
            handleNavigationTo(constants.INDICTMENTS_CASE_FILE_ROUTE)
          }
          nextIsDisabled={!stepIsValid}
          nextIsLoading={isLoadingWorkingCase}
        />
      </FormContentContainer>
    </PageLayout>
  )
}

export default PoliceCaseFilesRoute
