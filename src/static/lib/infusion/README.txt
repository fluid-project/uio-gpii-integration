MyInfusion was built from an unreleased version of Infusion (c4017a883ac8b9c9ef347fe3277e91cf1d0ed985), 
cindyli branch FLUID-1653 (https://github.com/cindyli/infusion/tree/FLUID-1653) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
