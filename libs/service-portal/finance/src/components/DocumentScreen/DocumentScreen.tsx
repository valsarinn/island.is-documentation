import format from 'date-fns/format'
import sub from 'date-fns/sub'
import sortBy from 'lodash/sortBy'
import React, { FC, useEffect, useState } from 'react'
import cn from 'classnames'

import { gql, useLazyQuery } from '@apollo/client'
import {
  Accordion,
  AccordionItem,
  AlertBanner,
  Box,
  Button,
  DatePicker,
  Filter,
  FilterInput,
  GridColumn,
  GridRow,
  Hidden,
  Pagination,
  SkeletonLoader,
  Stack,
  Table as T,
  Text,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import {
  amountFormat,
  ErrorScreen,
  formSubmit,
  IntroHeader,
  m,
  tableStyles,
} from '@island.is/service-portal/core'
import { dateFormat } from '@island.is/shared/constants'

import * as styles from '../../screens/Finance.css'
import { billsFilter } from '../../utils/simpleFilter'
import { DocumentsListItemTypes } from './DocumentScreen.types'
import DropdownExport from '../DropdownExport/DropdownExport'
import { exportGeneralDocuments } from '../../utils/filesGeneral'

const ITEMS_ON_PAGE = 20

const defaultCalState = { top: false, lower: false }

interface Props {
  title: string
  intro: string
  listPath: string
  defaultDateRangeMonths?: number
}

const getFinanceDocumentsListQuery = gql`
  query getFinanceDocumentsListQuery($input: GetDocumentsListInput!) {
    getDocumentsList(input: $input) {
      downloadServiceURL
      documentsList {
        id
        date
        type
        note
        sender
        dateOpen
        amount
      }
    }
  }
`

const DocumentScreen: FC<Props> = ({
  title,
  intro,
  listPath,
  defaultDateRangeMonths = 3,
}) => {
  const { formatMessage } = useLocale()

  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [openCal, setOpenCal] = useState<{ top: boolean; lower: boolean }>(
    defaultCalState,
  )
  const [q, setQ] = useState<string>('')
  const backInTheDay = sub(new Date(), {
    months: defaultDateRangeMonths,
  })

  const [loadDocumentsList, { data, loading, called, error }] = useLazyQuery(
    getFinanceDocumentsListQuery,
  )

  const billsDataArray: DocumentsListItemTypes[] =
    (data?.getDocumentsList?.documentsList &&
      billsFilter(data.getDocumentsList.documentsList, q)) ||
    []

  const totalPages =
    billsDataArray.length > ITEMS_ON_PAGE
      ? Math.ceil(billsDataArray.length / ITEMS_ON_PAGE)
      : 0

  function clearAllFilters() {
    setFromDate(backInTheDay)
    setToDate(new Date())
    setQ('')
  }

  useEffect(() => {
    if (toDate && fromDate) {
      loadDocumentsList({
        variables: {
          input: {
            dayFrom: format(fromDate, 'yyyy-MM-dd'),
            dayTo: format(toDate, 'yyyy-MM-dd'),
            listPath: listPath,
          },
        },
      })
    }
  }, [toDate, fromDate])

  useEffect(() => {
    setFromDate(backInTheDay)
    setToDate(new Date())
  }, [])

  if (error && !loading) {
    return (
      <ErrorScreen
        figure="./assets/images/hourglass.svg"
        tagVariant="red"
        tag={formatMessage(m.errorTitle)}
        title={formatMessage(m.somethingWrong)}
        children={formatMessage(m.errorFetchModule, {
          module: title.toLowerCase(),
        })}
      />
    )
  }

  return (
    <Box marginBottom={[6, 6, 10]}>
      <IntroHeader title={title} intro={intro} />
      <Stack space={2}>
        <GridRow>
          <GridColumn span={['12/12', '12/12', '12/12', '6/12']}>
            <Box display="flex" printHidden>
              <Box paddingRight={2}>
                <Button
                  colorScheme="default"
                  icon="print"
                  iconType="filled"
                  onClick={() => window.print()}
                  preTextIconType="filled"
                  size="default"
                  type="button"
                  variant="utility"
                >
                  {formatMessage(m.print)}
                </Button>
              </Box>
              <DropdownExport
                onGetCSV={() =>
                  exportGeneralDocuments(billsDataArray, title, 'csv')
                }
                onGetExcel={() =>
                  exportGeneralDocuments(billsDataArray, title, 'xlsx')
                }
              />
            </Box>
          </GridColumn>
        </GridRow>
        <Hidden print={true}>
          <Box marginTop={[1, 1, 2, 2, 5]}>
            <Filter
              resultCount={0}
              variant="popover"
              align="left"
              reverse
              labelClear={formatMessage(m.clearFilter)}
              labelClearAll={formatMessage(m.clearAllFilters)}
              labelOpen={formatMessage(m.openFilter)}
              labelClose={formatMessage(m.closeFilter)}
              popoverFlip={false}
              filterInput={
                <FilterInput
                  placeholder={formatMessage(m.searchPlaceholder)}
                  name="finance-document-input"
                  value={q}
                  onChange={(e) => setQ(e)}
                  backgroundColor="blue"
                />
              }
              onFilterClear={clearAllFilters}
            >
              <Box className={styles.dateFilterSingle} paddingX={3}>
                <Box width="full" />
                <Box marginTop={1}>
                  <Accordion
                    dividerOnBottom={false}
                    dividerOnTop={false}
                    singleExpand={false}
                  >
                    <AccordionItem
                      key="date-accordion-item"
                      id="date-accordion-item"
                      label={formatMessage(m.datesLabel)}
                      labelColor="blue400"
                      labelUse="h5"
                      labelVariant="h5"
                      iconVariant="small"
                    >
                      <Box
                        className={cn(styles.accordionBoxSingle, {
                          [styles.openCal]: openCal?.top,
                          [styles.openLowerCal]: openCal?.lower,
                        })}
                        display="flex"
                        flexDirection="column"
                      >
                        <DatePicker
                          label={formatMessage(m.datepickerFromLabel)}
                          placeholderText={formatMessage(m.datepickLabel)}
                          locale="is"
                          backgroundColor="blue"
                          size="xs"
                          handleChange={(d) => setFromDate(d)}
                          handleOpenCalendar={() =>
                            setOpenCal({ top: true, lower: false })
                          }
                          handleCloseCalendar={() =>
                            setOpenCal(defaultCalState)
                          }
                          selected={fromDate}
                        />
                        <Box marginTop={3}>
                          <DatePicker
                            label={formatMessage(m.datepickerToLabel)}
                            placeholderText={formatMessage(m.datepickLabel)}
                            locale="is"
                            backgroundColor="blue"
                            size="xs"
                            handleChange={(d) => setToDate(d)}
                            handleOpenCalendar={() =>
                              setOpenCal({ top: false, lower: true })
                            }
                            handleCloseCalendar={() =>
                              setOpenCal(defaultCalState)
                            }
                            selected={toDate}
                          />
                        </Box>
                      </Box>
                    </AccordionItem>
                  </Accordion>
                </Box>
              </Box>
            </Filter>
          </Box>
        </Hidden>
        <Box marginTop={2}>
          {!called && !loading && (
            <AlertBanner
              description={formatMessage(m.datesForResults)}
              variant="info"
            />
          )}
          {loading && (
            <Box padding={3}>
              <SkeletonLoader space={1} height={40} repeat={5} />
            </Box>
          )}
          {billsDataArray.length === 0 && called && !loading && !error && (
            <AlertBanner
              description={formatMessage(m.noResultsTryAgain)}
              variant="warning"
            />
          )}
          {billsDataArray.length > 0 ? (
            <T.Table>
              <T.Head>
                <T.Row>
                  <T.HeadData style={tableStyles}>
                    <Text variant="medium" fontWeight="semiBold">
                      {formatMessage(m.date)}
                    </Text>
                  </T.HeadData>
                  <T.HeadData style={tableStyles}>
                    <Text variant="medium" fontWeight="semiBold">
                      {formatMessage(m.transactionType)}
                    </Text>
                  </T.HeadData>
                  <T.HeadData style={tableStyles}>
                    <Text variant="medium" fontWeight="semiBold">
                      {formatMessage(m.performingOrganization)}
                    </Text>
                  </T.HeadData>
                  <T.HeadData box={{ textAlign: 'right' }} style={tableStyles}>
                    <Text variant="medium" fontWeight="semiBold">
                      {formatMessage(m.amount)}
                    </Text>
                  </T.HeadData>
                  <T.HeadData style={tableStyles}>
                    <Text variant="medium" fontWeight="semiBold">
                      {formatMessage(m.explanationNote)}
                    </Text>
                  </T.HeadData>
                </T.Row>
              </T.Head>
              <T.Body>
                {sortBy(billsDataArray, (item) => {
                  return item.date
                })
                  .reverse()
                  .slice(ITEMS_ON_PAGE * (page - 1), ITEMS_ON_PAGE * page)
                  .map((listItem) => (
                    <T.Row key={listItem.id}>
                      <T.Data style={tableStyles}>
                        <Text variant="medium">
                          {format(new Date(listItem.date), dateFormat.is)}
                        </Text>
                      </T.Data>
                      <T.Data
                        box={{ position: 'relative' }}
                        style={tableStyles}
                      >
                        <Button
                          variant="text"
                          size="medium"
                          onClick={() =>
                            formSubmit(
                              `${data?.getDocumentsList?.downloadServiceURL}${listItem.id}`,
                            )
                          }
                        >
                          {listItem.type}
                        </Button>
                      </T.Data>
                      <T.Data style={tableStyles}>
                        <Text variant="medium">{listItem.sender}</Text>
                      </T.Data>
                      <T.Data box={{ textAlign: 'right' }} style={tableStyles}>
                        <Text variant="medium">
                          {amountFormat(listItem.amount)}
                        </Text>
                      </T.Data>
                      <T.Data style={tableStyles}>
                        <Text variant="medium">{listItem.note}</Text>
                      </T.Data>
                    </T.Row>
                  ))}
              </T.Body>
            </T.Table>
          ) : null}
          {totalPages > 0 ? (
            <Box paddingTop={8}>
              <Pagination
                page={page}
                totalPages={totalPages}
                renderLink={(page, className, children) => (
                  <Box
                    cursor="pointer"
                    className={className}
                    onClick={() => setPage(page)}
                  >
                    {children}
                  </Box>
                )}
              />
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Box>
  )
}

export default DocumentScreen
