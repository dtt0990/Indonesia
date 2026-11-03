THTTEX SHOWROOM – OPTION 3 UPDATE

Contents
- index.html: revised web app for 3 options, separate selection/quantity per option, editable shared item prices.
- option3-view1.png: new concept, Customer Map view.
- option3-view2.png: new concept, Sustainability/TV view.
- Code.gs: revised Apps Script backend; GET returns complete Google Sheet item catalog; POST updates editable prices.

Live Google Sheet (already updated):
https://docs.google.com/spreadsheets/d/1lSTvAWcYywBv4u4U4302Viw7u5zKuxZtg4IhyPkTZ5Q/edit
Tab: Sheet1; new columns R and S plus six new Option 3 item rows (25-30).

IMPORTANT - Deploy both pieces:
1) In the existing Apps Script project linked to that spreadsheet, replace the source with Code.gs, save, and redeploy an updated version of the existing web app. Verify the existing deployment URL still works and GET returns {ok:true,items:[...]...}. If using a new deployment URL, change API_URL in index.html accordingly.
2) In the GitHub Pages repository dtt0990/Indonesia, upload the new index.html (rename this exact file if required by your deployment), option3-view1.png and option3-view2.png into the repo root on the intended branch. Commit and wait for GitHub Pages to refresh.
3) Test with an authorized user name: Option 1 and Option 2 selections do not change when editing Option 3; edit a unit price, check Saved status, refresh the site and verify price from Google Sheet; confirm export for each Option uses only that Option's choices.

Price note: unit price is shared per item_id among the three options; quantities and included flags are per option and kept in the user's browser localStorage. No hotspot functionality. Six new items remain unpriced until user enters a quote.

Caution: Google Apps Script web apps have deployment-specific authentication/sharing policies. Ensure GET/POST permissions are appropriate for intended users, and use the existing access policy. This code preserves the existing user-supplied name attribution and does not add authentication.

No published application code has been changed by generating this ZIP.
