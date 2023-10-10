### Ecency Mobile

iOS ![iOS](https://build.appcenter.ms/v0.1/apps/ef80aa2a-d4e1-4f43-a4f8-be12ea72ba9b/branches/master/badge)
Android ![Android](https://build.appcenter.ms/v0.1/apps/12aace32-b58a-49da-bf85-5477f89ae16e/branches/master/badge)

## Open Beta 🔥

[IOS](https://install.appcenter.ms/orgs/ecency/apps/ios/distribution_groups/beta_testers)

[ANDROID](https://install.appcenter.ms/orgs/ecency/apps/android/distribution_groups/beta_testers)

## Download

AppStore iOS: https://ios.ecency.com
PlayStore Android: https://android.ecency.com

### I. How do I get set up? 🔧

`$ git clone https://github.com/ecency/ecency-mobile.git`

`$ cd ecency-mobile`

`$ yarn`

`$ react-native start` (Now your local server should start)

## Setting up Reactotron

`Reactotron` for logging,

- Install: [download here](https://github.com/infinitered/reactotron/blob/master/docs/installing.md)
- Run: After installation, start the reactotron desktop application
- Link: For android, run `adb reverse tcp:9090 tcp:9090` and restart app. For iOS, it should connect without further config.
- Usage:
  1. use `Timeline` tab to track logs and network call
  2. use `State` tab to track redux stage changes, to track particular store, add it by its initializing name, example: `account`

## Starting for IOS

### `react-native run-ios` (this also run `react-native start` if you didn't)

## Starting for Android

1. Create a new app in your firebase console.
2. Choose Add Android platform, with a package name of `app.esteem.mobile.android`
3. Download the generated `google-services.json` and place it in `<project-root>/android/app/`
4. Connect dev device or start android emulator.
5. Run `npm run android` in the project's root.

##### Using Android Studio's `adb`

1. Make sure that you can run adb from your terminal.
2. Open Genymotion and navigate to `Settings -> ADB`. Select “Use custom Android SDK tools” and update with your [Android SDK directory](https://stackoverflow.com/questions/25176594/android-sdk-location).

##### Using Genymotion's `adb`

1. Find Genymotion’s copy of adb. On macOS for example, this is normally `/Applications/Genymotion.app/Contents/MacOS/tools/`.
2. Add the Genymotion tools directory to your path (instructions for [Mac](http://osxdaily.com/2014/08/14/add-new-path-to-path-command-line/), [Linux](http://www.computerhope.com/issues/ch001647.htm), and [Windows](https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/)).
3. Make sure that you can run adb from your terminal.

# The Rules 🔪

### Patches and Review Process

#### Before you start

1.  When you address an issue or a feature, make sure that there doesn't already exist a ISSUES ticket for this work item.

- [Issues](https://github.com/ecency/ecency-mobile/issues)

2.  If the item already exists and is in progress, please remove the card or the issue you were assigned and leave a note that it is a duplicate.

3.  If the item is not being worked on, please make sure that you put the card or issue as "In Progress" and assign it to yourself so other developers know that you are working on it.

#### Patch a day

It is important to make the work you are doing visible to other team members, especially because there are developers in different locations.
Even if you are not done the work on your patch, make sure to put a Pull Request up and leave a note that this is work in progress (WIP) so that others do not try to merge in your patch.
If you would like to have someone in particular review your work, leave your patch as WIP and assign the developers that need to review or update your patch before it is ready to be reviewed by other team members.

#### Who to assign your patch for review

- [@feruzm](https://github.com/feruzm) 👮
- [@talhasch](https://github.com/talhasch) 🕵
- [@mistikk](https://github.com/mistikk) 👽
- [@ue](https://github.com/ue) 💀

### Patch Review Template

When you create a pull request for your patch, make sure to leave all the information that other team members will need to understand the purpose of your patch as well.

Main Branch `master`

If you resolved an issue or something, you have to include the issue number (for ex. resolved #10 or closed #10) in your pr commit message.

#### Before you start

1. Pull every changes.
2. Switch your branch with development
3. Create about issues or bugfix branch.
4. Make sure your repo up to date!

#### Creating branch

- For example if you want create branch for an issue should contain issue number (ex. #55)
- Whats your interest put bugfix/your*branch_name or feature/your_branch_name*#issue_number
- If you some changes for only config req config/your_branch_name

#### Commit messages

What ever you want number of commit. Before create push squash your all commit. We need just what you do!

#### Pushing

- Make sure push your main branch (master)

# Issues 👻

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@ecency.com

We will evaluate the risk and make a patch available before filing the issue.

# Sponsors and Collaborators

- Hive community
- React native community
- Bugsnag
- Appcenter
