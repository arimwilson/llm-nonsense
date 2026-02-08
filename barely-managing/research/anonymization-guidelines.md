# Anonymization Guidelines (Moderate)

Default approach: preserve operational context and decision mechanics while removing direct identifiers.

## Keep
- role level and function (for example: senior engineer, manager, HR partner)
- sequence of events and decision logic
- timeline shape (for example: quarterly planning, weekly review)

## Mask
- names and exact titles
- exact team names and product names
- exact dates tied to identifiable events
- country/city specifics unless legally necessary to explain constraints

## Composite Rule
When multiple incidents share the same lesson, merge non-essential details into one representative narrative.

## High-Risk Trigger
If anecdote card `risk_level` is `high`, require an explicit anonymization note in chapter draft before review lock.
