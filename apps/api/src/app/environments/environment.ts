import {
  ServerSideFeature,
  ServerSideFeatureClient,
} from '@island.is/feature-flags'

const prodConfig = () => ({
  production: true,
  xroad: {
    baseUrl: process.env.XROAD_BASE_PATH,
    clientId: process.env.XROAD_CLIENT_ID,
  },
  applicationSystem: {
    baseApiUrl: process.env.APPLICATION_SYSTEM_API_URL,
  },
  drivingLicense: {
    secret: process.env.XROAD_DRIVING_LICENSE_SECRET,
    v1: {
      xroadPath: process.env.XROAD_DRIVING_LICENSE_PATH,
    },
    v2: {
      xroadPath: ServerSideFeatureClient.isOn(ServerSideFeature.drivingLicense)
        ? process.env.XROAD_DRIVING_LICENSE_PATH
        : process.env.XROAD_DRIVING_LICENSE_V2_PATH,
    },
  },
  criminalRecord: {
    xroadPath: process.env.XROAD_CRIMINAL_RECORD_PATH,
  },
  education: {
    xroadLicenseServiceId: process.env.XROAD_MMS_LICENSE_SERVICE_ID,
    xroadGradeServiceId: process.env.XROAD_MMS_GRADE_SERVICE_ID,
    fileDownloadBucket: process.env.FILE_DOWNLOAD_BUCKET,
  },
  fileStorage: {
    uploadBucket: process.env.FILE_STORAGE_UPLOAD_BUCKET,
  },
  nationalRegistry: {
    baseSoapUrl: process.env.SOFFIA_SOAP_URL,
    user: process.env.SOFFIA_USER,
    password: process.env.SOFFIA_PASS,
    host: process.env.SOFFIA_HOST_URL,
  },
  healthInsurance: {
    wsdlUrl: process.env.XROAD_HEALTH_INSURANCE_WSDLURL,
    baseUrl: process.env.XROAD_BASE_PATH,
    username: process.env.XROAD_HEALTH_INSURANCE_USERNAME,
    password: process.env.XROAD_HEALTH_INSURANCE_PASSWORD,
    clientID: process.env.XROAD_CLIENT_ID,
    xroadID: process.env.XROAD_HEALTH_INSURANCE_ID,
  },
  healthInsuranceV2: {
    xRoadBaseUrl: process.env.XROAD_BASE_PATH,
    xRoadClientId: process.env.XROAD_CLIENT_ID,
    xRoadProviderId: process.env.XROAD_HEALTH_INSURANCE_ID,
    username: process.env.XROAD_HEALTH_INSURANCE_V2_XROAD_USERNAME,
    password: process.env.XROAD_HEALTH_INSURANCE_V2_XROAD_PASSWORD,
  },
  userProfile: {
    userProfileServiceBasePath: process.env.SERVICE_USER_PROFILE_URL,
  },
  auth: {
    issuer: process.env.IDENTITY_SERVER_ISSUER_URL,
    audience: ['@island.is', '@admin.island.is'],
  },
  documentService: {
    basePath: process.env.POSTHOLF_BASE_PATH,
    clientId: process.env.POSTHOLF_CLIENTID ?? '',
    clientSecret: process.env.POSTHOLF_CLIENT_SECRET ?? '',
    tokenUrl: process.env.POSTHOLF_TOKEN_URL ?? '',
  },
  documentProviderService: {
    test: {
      basePath: process.env.DOCUMENT_PROVIDER_BASE_PATH_TEST,
      clientId: process.env.DOCUMENT_PROVIDER_CLIENTID_TEST ?? '',
      clientSecret: process.env.DOCUMENT_PROVIDER_CLIENT_SECRET_TEST ?? '',
      tokenUrl: process.env.DOCUMENT_PROVIDER_TOKEN_URL_TEST ?? '',
    },
    prod: {
      basePath: process.env.DOCUMENT_PROVIDER_BASE_PATH,
      clientId: process.env.DOCUMENT_PROVIDER_CLIENTID ?? '',
      clientSecret: process.env.DOCUMENT_PROVIDER_CLIENT_SECRET ?? '',
      tokenUrl: process.env.DOCUMENT_PROVIDER_TOKEN_URL ?? '',
    },
    documentsServiceBasePath: process.env.SERVICE_DOCUMENTS_BASEPATH,
    documentProviderAdmins: process.env.DOCUMENT_PROVIDER_ADMINS,
  },
  syslumennService: {
    url: process.env.SYSLUMENN_HOST,
    username: process.env.SYSLUMENN_USERNAME,
    password: process.env.SYSLUMENN_PASSWORD,
  },
  icelandicNamesRegistry: {
    backendUrl: process.env.ICELANDIC_NAMES_REGISTRY_BACKEND_URL,
  },
  regulationsDomain: {
    url: process.env.REGULATIONS_API_URL,
  },
  endorsementSystem: {
    baseApiUrl: process.env.ENDORSEMENT_SYSTEM_BASE_API_URL,
  },
  paymentDomain: {
    xRoadBaseUrl: process.env.XROAD_BASE_PATH,
    xRoadProviderId: process.env.XROAD_PAYMENT_PROVIDER_ID,
    xRoadClientId: process.env.XROAD_CLIENT_ID,
    username: process.env.XROAD_PAYMENT_USER,
    password: process.env.XROAD_PAYMENT_PASSWORD,
    callbackBaseUrl: process.env.XROAD_PAYMENT_BASE_CALLBACK_URL,
    callbackAdditionUrl: process.env.XROAD_PAYMENT_ADDITION_CALLBACK_URL,
    arkBaseUrl: process.env.ARK_BASE_URL,
  },
  audit: {
    defaultNamespace: '@island.is/api',
    groupName: process.env.AUDIT_GROUP_NAME,
    serviceName: 'api',
  },
  islykill: {
    cert: process.env.ISLYKILL_CERT,
    passphrase: process.env.ISLYKILL_SERVICE_PASSPHRASE,
    basePath: process.env.ISLYKILL_SERVICE_BASEPATH,
  },
})
const devConfig = () => ({
  production: false,
  xroad: {
    baseUrl: 'http://localhost:8081',
    clientId: 'IS-DEV/GOV/10000/island-is-client',
  },
  applicationSystem: {
    baseApiUrl: 'http://localhost:3333',
  },
  drivingLicense: {
    secret: process.env.XROAD_DRIVING_LICENSE_SECRET,
    v1: {
      xroadPath:
        process.env.XROAD_DRIVING_LICENSE_PATH ??
        'r1/IS-DEV/GOV/10005/Logreglan-Protected/RafraentOkuskirteini-v1',
    },
    v2: {
      xroadPath:
        process.env.XROAD_DRIVING_LICENSE_V2_PATH ??
        'r1/IS-DEV/GOV/10005/Logreglan-Protected/RafraentOkuskirteini-v2',
    },
  },
  criminalRecord: {
    xroadPath:
      process.env.XROAD_CRIMINAL_RECORD_PATH ??
      'r1/IS-DEV/GOV/10005/Logreglan-Protected/Sakavottord-PDF-v2',
  },
  education: {
    xroadLicenseServiceId: 'IS-DEV/EDU/10020/MMS-Protected/license-api-v1',
    xroadGradeServiceId: 'IS-DEV/EDU/10020/MMS-Protected/grade-api-v1',
    fileDownloadBucket: 'island-is-dev-download-cache-api',
  },
  fileStorage: {
    uploadBucket: process.env.FILE_STORAGE_UPLOAD_BUCKET,
  },
  nationalRegistry: {
    baseSoapUrl: 'https://localhost:8443',
    user: process.env.SOFFIA_USER ?? '',
    password: process.env.SOFFIA_PASS ?? '',
    host: 'soffiaprufa.skra.is',
  },
  healthInsurance: {
    wsdlUrl:
      process.env.XROAD_HEALTH_INSURANCE_WSDLURL ??
      'https://test-huld.sjukra.is/islandrg?wsdl',
    baseUrl: process.env.XROAD_BASE_PATH ?? 'http://localhost:8080',
    username: process.env.XROAD_HEALTH_INSURANCE_USERNAME ?? '',
    password: process.env.XROAD_HEALTH_INSURANCE_PASSWORD ?? '',
    clientID: process.env.XROAD_CLIENT_ID ?? '',
    xroadID: process.env.XROAD_HEALTH_INSURANCE_ID ?? '',
  },
  healthInsuranceV2: {
    xRoadBaseUrl: process.env.XROAD_BASE_PATH ?? 'http://localhost:8080',
    xRoadClientId:
      process.env.XROAD_CLIENT_ID ?? 'IS-DEV/GOV/10000/island-is-client',
    xRoadProviderId:
      process.env.XROAD_HEALTH_INSURANCE_ID ??
      'IS-DEV/GOV/10007/SJUKRA-Protected',
    username: process.env.XROAD_HEALTH_INSURANCE_V2_XROAD_USERNAME ?? '',
    password: process.env.XROAD_HEALTH_INSURANCE_V2_XROAD_PASSWORD ?? '',
  },
  userProfile: {
    userProfileServiceBasePath: 'http://localhost:3366',
  },
  auth: {
    issuer: 'https://identity-server.dev01.devland.is',
    audience: ['@island.is', '@admin.island.is'],
  },
  documentService: {
    basePath: process.env.POSTHOLF_BASE_PATH,
    clientId: process.env.POSTHOLF_CLIENTID ?? '',
    clientSecret: process.env.POSTHOLF_CLIENT_SECRET ?? '',
    tokenUrl: process.env.POSTHOLF_TOKEN_URL ?? '',
  },
  documentProviderService: {
    documentsServiceBasePath: 'http://localhost:3369',
    documentProviderAdmins: process.env.DOCUMENT_PROVIDER_ADMINS ?? '',
    test: {
      basePath:
        'https://test-documentprovidermanagement-island-is.azurewebsites.net',
      clientId: process.env.DOCUMENT_PROVIDER_CLIENTID_TEST ?? '',
      clientSecret: process.env.DOCUMENT_PROVIDER_CLIENT_SECRET_TEST ?? '',
      tokenUrl: process.env.DOCUMENT_PROVIDER_TOKEN_URL_TEST ?? '',
    },
    prod: {
      basePath:
        'https://test-documentprovidermanagement-island-is.azurewebsites.net',
      clientId: process.env.DOCUMENT_PROVIDER_CLIENTID ?? '',
      clientSecret: process.env.DOCUMENT_PROVIDER_CLIENT_SECRET ?? '',
      tokenUrl: process.env.DOCUMENT_PROVIDER_TOKEN_URL ?? '',
    },
  },
  syslumennService: {
    url: process.env.SYSLUMENN_HOST ?? '',
    username: process.env.SYSLUMENN_USERNAME ?? '',
    password: process.env.SYSLUMENN_PASSWORD ?? '',
  },
  rskDomain: {
    url: process.env.RSK_URL,
    username: process.env.RSK_USERNAME,
    password: process.env.RSK_API_PASSWORD,
  },
  rskCompanyInfo: {
    xRoadBaseUrl: process.env.XROAD_BASE_PATH,
    xRoadProviderId: process.env.COMPANY_REGISTRY_XROAD_PROVIDER_ID,
    xRoadClientId: process.env.XROAD_CLIENT_ID,
    apiPath: process.env.COMPANY_REGISTRY_XROAD_API_PATH,
  },
  icelandicNamesRegistry: {
    backendUrl: 'http://localhost:4239',
  },
  regulationsDomain: {
    url:
      process.env.REGULATIONS_API_URL ??
      'https://reglugerdir-api.herokuapp.com/api/v1',
  },
  endorsementSystem: {
    baseApiUrl: 'http://localhost:4246',
  },
  paymentDomain: {
    xRoadBaseUrl: process.env.XROAD_BASE_PATH ?? 'http://localhost:8080',
    xRoadProviderId:
      process.env.XROAD_PAYMENT_PROVIDER_ID ?? 'IS-DEV/GOV/10021/FJS-Public',
    xRoadClientId: process.env.XROAD_CLIENT_ID,
    username: process.env.XROAD_PAYMENT_USER,
    password: process.env.XROAD_PAYMENT_PASSWORD,
    callbackBaseUrl: process.env.XROAD_PAYMENT_BASE_CALLBACK_URL,
    callbackAdditionUrl: process.env.XROAD_PAYMENT_ADDITION_CALLBACK_URL,
    arkBaseUrl: process.env.ARK_BASE_URL,
  },
  audit: {
    defaultNamespace: '@island.is/api',
  },
  islykill: {
    cert: process.env.ISLYKILL_CERT,
    passphrase: process.env.ISLYKILL_SERVICE_PASSPHRASE,
    basePath: process.env.ISLYKILL_SERVICE_BASEPATH,
  },
})
export const getConfig =
  process.env.PROD_MODE === 'true' || process.env.NODE_ENV === 'production'
    ? prodConfig()
    : devConfig()
