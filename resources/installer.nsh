; installer.nsh — Custom NSIS hooks for PMR installer

!macro customInstall
  ; Copy pmr.exe to install dir root so it is easier to add to PATH
  CopyFiles "$INSTDIR\resources\pmr.exe" "$INSTDIR\pmr.exe"

  ; Show a message box explaining how to add pmr to PATH
  MessageBox MB_ICONINFORMATION|MB_OK \
    "PMR CLI Tool installed!$\n$\n\
To use the 'pmr' command from any terminal:$\n$\n\
  1. Open Start → search 'Environment Variables'$\n\
  2. Click 'Edit the system environment variables'$\n\
  3. Click 'Environment Variables…'$\n\
  4. Under 'System Variables', select 'Path' → Edit$\n\
  5. Click 'New' and add:$\n\
     $INSTDIR$\n$\n\
Then open a new terminal and type:  pmr help"
!macroend

!macro customUninstall
  Delete "$INSTDIR\pmr.exe"
!macroend
