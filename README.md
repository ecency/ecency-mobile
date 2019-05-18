### eSteem Mobile

iOS ![iOS](https://build.appcenter.ms/v0.1/apps/ef80aa2a-d4e1-4f43-a4f8-be12ea72ba9b/branches/master/badge)
  Android ![Android](https://build.appcenter.ms/v0.1/apps/12aace32-b58a-49da-bf85-5477f89ae16e/branches/master/badge)
  
### Production 🚀
[IOS](https://itunes.apple.com/cy/app/esteem-v2/id1451896376?l=tr&mt=8)

[ANDROID](https://play.google.com/store/apps/details?id=app.esteem.mobile)

## Open Beta 🔥
[IOS](https://install.appcenter.ms/orgs/esteem.app/apps/esteem-1/distribution_groups/beta_testers)

[ANDROID](https://install.appcenter.ms/orgs/esteem.app/apps/esteem/distribution_groups/beta_testers)

### I. How do I get set up? 🔧

`$ git clone https://github.com/esteemapp/esteem-mobile.git`

`$ cd esteem-mobile`

`$ yarn`

`$ react-native start` (Now your local server should start)

## Starting for IOS

### `react-native run-ios` (this also run `react-native start` if you didn't)

## Starting for Android

TODO

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

- [Issues](https://github.com/esteemapp/esteem-mobile/issues)

2.  If the item already exists and is in progress, please remove the card or the issue you were assigned and leave a note that it is a duplicate.
    3.If the item is not being worked on, please make sure that you put the card or issue as "In Progress" and assign it to yourself so other developers know that you are working on it.

#### Patch a day

It is important to make the work you are doing visible to other team members, especially because there are developers in different location.
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

If you resolved a issue or something You have to whern you commit your pr commit message include issue number for ex. resolved #10 or closed #10 etc.

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

If you find a security issue please report details to: security@esteem.app

We will evaluate the risk and make a patch available before filing the issue.
