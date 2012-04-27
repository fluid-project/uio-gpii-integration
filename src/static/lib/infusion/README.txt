MyInfusion was built from an unreleased version of Infusion (561a92b896846703354ae95546e7db6813792fb4), 
cindyli branch FLUID-1653 (https://github.com/cindyli/infusion/tree/FLUID-1653) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
