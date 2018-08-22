import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/Pages/HelloWorld'
import Auth0Callback from '@/components/Pages/Auth0Callback'
import Auth0Redirect from '@/components/Pages/Auth0Redirect'
import Super from '@/components/Pages/Super/Index'
import SuperUser from '@/components/Pages/Super/User/Index'
import SuperExpert from '@/components/Pages/Super/Expert/Index'
import SuperGig from '@/components/Pages/Super/Gig/Index'
import SuperCompany from '@/components/Pages/Super/Company/Index'
import Company from '@/components/Pages/Company/Index'
import CompanyOnboarding from '@/components/Pages/Company/Onboarding/Index'
import CompanyGigPost from '@/components/Pages/Company/Gig/Post/Index'
import CompanyJobsManagement from '@/components/Pages/Company/Management/Jobs'
import CompanyCandidatesManagement from '@/components/Pages/Company/Management/Candidates'
import Expert from '@/components/Pages/Expert/Index'
import ExpertOnboard from '@/components/Pages/Expert/Onboard'
import ExpertProfile from '@/components/Pages/Expert/Profile/Index'
import WhoAreYou from '@/components/Pages/WhoAreYou'
import LandingPage from '@/components/Pages/Landing/Index'
import TestAddressAutocomplete from '@/components/Test/Address'
import store from '../store'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HelloWorld
    },
    {
      path: '/auth0/callback',
      name: 'auth0-callback',
      component: Auth0Callback
    },
    {
      path: '/auth0/redirect',
      name: 'auth0-redirect',
      component: Auth0Redirect
    },
    {
      path: '/super',
      name: 'super',
      component: Super
    },
    {
      path: '/super/user',
      name: 'super-user',
      component: SuperUser,
      props: (route) => ({
        action: route.query.action
      })
    },
    {
      path: '/super/expert/:userProfileId?',
      name: 'super-expert',
      component: SuperExpert
    },
    {
      path: '/super/gig/:gigId?',
      name: 'super-gig',
      component: SuperGig
    },
    {
      path: '/super/company/:companyId?',
      name: 'super-company',
      component: SuperCompany
    },
    {
      path: '/super/company/:companyId/gig/:gigId?',
      name: 'super-company-gig',
      component: SuperGig
    },
    {
      path: '/company',
      name: 'company',
      component: Company
    },
    {
      path: '/company/onboarding/:step?',
      name: 'company-onboarding',
      component: CompanyOnboarding
    },
    {
      path: '/company/gig/post/:gigId?',
      name: 'company-gig-post',
      component: CompanyGigPost
    },
    {
      path: '/company/jobs-management',
      name: 'company-jobs-management',
      component: CompanyJobsManagement
    },
    {
      path: '/company/candidates-management',
      name: 'company-candidates-management',
      component: CompanyCandidatesManagement
    },
    {
      path: '/expert',
      name: 'expert',
      component: Expert
    },
    {
      path: '/expert/onboard',
      name: 'expert-onboard',
      component: ExpertOnboard
    },
    {
      path: '/expert/profile/:step?',
      name: 'expert-profile',
      component: ExpertProfile
    },
    {
      path: '/who-are-you/:state?',
      name: 'who-are-you',
      component: WhoAreYou
    },
    {
      path: '/lp/:slug?',
      name: 'landing-page',
      component: LandingPage
    },
    {
      path: '/test/address-autocomplete',
      name: 'test-address-autocomplete',
      component: TestAddressAutocomplete
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log('in router.beforeEach trying to get to', to.name)
  // TODO: add error tooling
  let pass = true
  let toRoot = to.path.split('/')[1]
  switch (toRoot) {
    case 'super':
      // test if this is cool
      pass = store.getters['auth/hasGroup']('Super Admin')
      break
    case 'company':
      // test if this is cool
      pass = store.getters['auth/hasGroup']('Company Admin')
      break
    case 'expert':
      // test if this is cool
      pass = store.getters['auth/hasGroup']('Expert')
      break
    default:
      pass = true
      break
  }
  if (pass) {
    next()
  } else {
    // TODO: if I am lost, what would I want to have happen?
    next({ name: 'home' })
  }
})

export default router
