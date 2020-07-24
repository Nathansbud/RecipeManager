const spreadsheet = SpreadsheetApp.getActive()
const historyHeader = ["Date", "Code", "Recipe"]
const docsUrl = "https://docs.google.com/document/d/"

function onOpen(e) {
  const menuItems = [{name: 'Make Recipes From Notes', functionName: 'createRecipeDocument'}]
  spreadsheet.addMenu('Recipes', menuItems)
}

function getData() {
  const recipeTab = spreadsheet.getSheetByName("Recipes")
  const historyTab = spreadsheet.getSheetByName("Cooked History")
  
  const recipes = recipeTab.getRange(1, 1, recipeTab.getLastRow(), recipeTab.getLastColumn()).getValues()
  const history = historyTab.getRange(2, 1, historyTab.getLastRow() - 1, historyTab.getLastColumn()).getValues()
  
  Logger.log(recipes, history)
}

function createRecipeDocument() {
  const recipeTab = spreadsheet.getSheetByName("Recipes")
  const recipeRange = recipeTab.getRange(2, 1, recipeTab.getLastRow() - 1, recipeTab.getLastColumn())
  
  const notes = recipeRange.getNotes() 
  
  for(let [i, row] of Object.entries(recipeRange.getValues())) {
    for(let [j, col] of Object.entries(row)) {
      if(notes[i][j] && notes[i][j].toLowerCase().trim().startsWith('recipe')) {
        const cell = recipeTab.getRange(parseInt(i) + 2, parseInt(j) + 1)
        if(!cell.getFormula().startsWith("=HYPERLINK")) {
          const recipeDoc = DocumentApp.create(col + " Recipe")
          const body = recipeDoc.getBody()
          notes[i][j].split("\n").filter((n) => !!n).forEach((v) => body.appendListItem(v).setGlyphType(DocumentApp.GlyphType.BULLET))
          cell.setFormula(`=HYPERLINK("${docsUrl + recipeDoc.getId()}", "${col}")`)
          DriveApp.getFileById(recipeDoc.getId()).addEditors(SpreadsheetApp.getActive().getEditors().map(ed => ed.getEmail()))
        }
      }
    }
  }
}