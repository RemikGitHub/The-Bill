﻿import { jsPDF } from "jspdf";

let font =
let callAddFont = function () {
  this.addFileToVFS("arial-bold.ttf", font);
  this.addFont("arial-bold.ttf", "arial", "bold");
};
jsPDF.API.events.push(["addFonts", callAddFont]);