; installer.nsh — Custom NSIS hooks for PMR installer

!macro customInstall
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
  ; Remove the CLI exe placed at install root
  Delete "$INSTDIR\pmr.exe"

  ; Ask user whether to keep or delete patient data
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to permanently delete all patient records and settings?$\n$\n\
Click YES to delete all data (records, backups, face data).$\n\
Click NO to keep your data — it will still be there if you reinstall." \
    IDNO keep_data

  ; Delete the AppData folder for this app
  RMDir /r "$APPDATA\patient-records-manager"

  keep_data:
!macroend
