MyInfusion was built from an unreleased version of Infusion (9f3c4ba14a5a58285ddb5980f9af0f79bda915d5), 
cindyli branch FLUID-1653 (https://github.com/cindyli/infusion/tree/FLUID-1653) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
