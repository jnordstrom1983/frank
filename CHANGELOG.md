## 0.0.13
- Remember folder selection when returning from editing content and

## 0.0.10
- Adding support for S3_LOCATIONTEMPLATE

## 0.0.9
- Adding support for multi language UI, Swedish added as language

## 0.0.8
- Adding support for language wildcard

## 0.0.7
- Feature: Adding support for modules
- Feature: Adding Translation files module
- Feature: Adding support for links to external systems
- Feature: Adding userFeatures settings to enable / disable features for regular users
- Feature: Adding external preview

## 0.0.6
- Feature: Handle SVG-files as images and not files
- Feature: Adding Boolean data type
- Feature/Portal: View Typescript interfaces on Content Type editing view
- Feature/Portal: Add "Copy to clipboard" button on various places
- Fix/UX: Adding some tooltips throughout the UI
- Fix/UX: Redesigning asset list to align with content list


## 0.0.5
- Feature/Portal: Add setting to make Content Types hidden, meaning that they will be hidden from Content Listing page.
- Fix/UX: Redesigning table on Content Listing page to fit more information
  

## 0.0.4
- Feature/Portal: Redesigned add field dialog
- Feature/Portal: Options can be sorted when configuring a field
- Feature/Portal: Object / Object[] data types added
- Other: Name and logo change

## 0.0.3
- Feature/Portal: Sorting of content in the Content API
- Feature/Portal: Asset details page now returns a list of pages using this asset
- Feature/Portal: Exposing trash and make it possible to restore deleted content
- Feature/Portal: Create folder from content editing view
- Feature/Portal: Create folder from asset editing view
- Feature/Portal: Filter content on modified date on content listing view
- Feature/Portal: Exposing app version under Settings
- Feature/Content API: Make it possible to fetch drafts by using a acceess key that have been configured with draft access
- Feature/Content API: Returning publishDate when fetching content (please note that existing content needs to be depublished and republished to get the publishDate)
- Feature/Space API: New API to manage Trash implemented
- Fix/Backend: Cleaning up database by deleting unsaved new content one day after created
- Fix/Backend: Databas migration support added, executed upon first login after upgrade



## 0.0.2
- Feature: Content Type / Make it possible to remove unused content type.
- Feature: Do not navigate away when saving content
- Feature: Warn when closing content with unsaved content
- Feature: Title length is limited to 30 characters
- Feature: Allways show "Content Access Keys"
- Fix/Bug: Invalid API path in Content API documentation
- Fix/UX: Settings / Configure button with settings icon was separate components now both text and icon is inside the same button
- Fix/UX: Side menu buttons was not rounded when hover
- Fix/Copy: Wenhook -> Webhook
- Fix/Copy: Strange description of Content API


## 0.0.1
- Initial release
