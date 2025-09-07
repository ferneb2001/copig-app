procedure exo
*modificacion de expedientes
hide menu pant01
@03,02 clear to 23,78
@03,24 say 'MODIFICACION DE EXPEDIENTES' color n/w 
@04,02 clear to 23,78
@05,03 say 'Nro.Nota  de fecha  recibida  Remitente' color n/w
wsigue='S'
wnro=0
wletra=space(1)
wano=0
wop=0
wrecep={  /  /  }
wrtte1=space(40)
wrtte2=space(40)
wdest=space(30)
wcpto1=space(75)
wcpto2=space(75)
wcpto3=space(75)
wcpto4=space(75)
wmatri=0
wcateg=space(2)
wclase=0
wnomp=space(30)
do while wsigue='S'
   @22,11 clear to 22,72
   @21,10 say 'Indique el nro.de Expte. a consultar o <ESC> para salir';
          color n/w
   @07,02 get wletra pict '!'
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '9999'
   read
   @21,02 clear to 21,78
   if lastkey()<>27
*      wano=wano+1900
      wkey=wletra+str(wnro,5)+str(wano,4)
      select 1
      use exptes index exptesi, exptprf
      seek(wkey)
      if found()
         @07,23 say recep color n/w
         @07,33 say rtrim(rtte) color n/w
         @08,33 say rtrim(rtte2) color n/w
         @09,35 say 'Concepto' color n/w
         @10,03 say cpto color n/w
         @11,03 say cpto2 color n/w
         @12,03 say cpto3 color n/w
         @13,03 say cpto4 color n/w
         @15,03 say 'Matricula:        Categor¡a'
         @15,14 say matri pict '99999'
         @15,31 say cat pict '!!'
         @15,48 say inomb
         @16,31 say clase pict '9'
         @23,28 get wop picture '@*H \<Modifica;\<Salir';
               size 1,1 color scheme 4
         read
         if wop=2
            wsigue='N'
         else
            do modifica
         endif   
      else
         @07,11 say 'error'
      endif
   else
      wsigue='N'
   endif
enddo               
@03,02 clear to 23,78
close all
do pie
return

procedure modifica
wrecep=recep
wrtte1=rtte
wrtte2=rtte2
wdest=space(30)
wcpto1=cpto
wcpto2=cpto2
wcpto3=cpto3
wcpto4=cpto4
wmatri=0
wcateg=cat
wclase=clase
wnomp=inomb
@07,23 get wrecep color n/w
@07,33 get wrtte1 color n/w pict '@!'
@08,33 get wrtte2 color n/w pict '@!'
@09,35 say 'Concepto' color n/w
@10,03 get wcpto1 color n/w pict '@!'
@11,03 get wcpto2 color n/w pict '@!'
@12,03 get wcpto3 color n/w pict '@!'
@13,03 get wcpto4 color n/w pict '@!'
@15,03 say 'Matricula:        Categor¡a'
@15,14 get wmatri pict '99999'
@15,31 get wcateg pict '!!'
@15,48 get wnomp pict '@!'
@16,31 get wclase pict '9'
read
replace recep with wrecep
replace rtte  with wrtte1
replace rtte2 with wrtte2
replace cpto  with wcpto1
replace cpto2 with wcpto2
replace cpto3 with wcpto3
replace cpto4 with wcpto4
replace matri with wmatri
replace cat   with wcateg
replace clase with wclase
replace inomb with wnomp
return