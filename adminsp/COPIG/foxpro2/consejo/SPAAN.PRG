procedure spaan
*Modificaciones de Nros.de Documentos
@04,01 clear to 23,78
@04,22 say 'MODIFICACION DE NUMEROS DE DOCUMENTOS'
@06,06 say 'MATRICULA CATEG.  TIPO NRO.DCTO. NOMBRE'
wsigue='S'
wmatri=0
wcateg=space(2)
wdctipo=0
wdcto=0
wnombre=space(30)
wdomici=space(44)
wprovin=0
wdpto=0
wlocali=0
wnacio={  /  /  }
wcuit=0
wsexo=space(1)
westciv=space(1)
wnacion=space(1)
wtelef=space(12)
wtipo=0
wfallec={  /  /  }
westado=space(1)
wdomleg=space(1)
select 1 
use spprof index spprof, spprofn
select 2
use spmatri index spmatri, spmatdo
select 3 
use spprofe index spprofe, spprofen
select 4
use spmatrie index spmatrie, spmatdoe
do while wsigue='S'
   @23,01 SAY 'Indique la matricula y categoria o <ESC> para salir'
   @08,08 get wmatri pict '99999'
   read
   if lastkey()<>27
      @08,17 get wcateg pict '!!'
      read
      @23,01 clear to 23,78
      if wcateg = 'EM'
         wkey=str(wmatri,5)+wcateg
         select 4
         seek(wkey)
         if found()
            @08,25 SAY dctipo
            @08,29 say dcnro
            wkey1=str(dctipo,1)+str(dcnro,8)
            select 3
            seek(wkey1)
            if found()
               wdcto=b.dcnro
               wdctipo=b.dctipo
               @08,39 say nombre
               @23,01 say 'Indique el nuevo n£mero o <ESC> para salir'
               @10,25 get wdctipo pict '9'
               @10,29 get wdcto pict '99999999'
               read
               @23,01 clear to 23,78
               if lastkey()<>27
                  wop=1
                  @23,30 get wop pict '@*H \<Salir;\<Modificar' size 1,1
                  read
                  if wop=2
                     do modifica
                  endif   
               endif
            else
               @08,33 say 'Sin datos personales'
            endif           
         else
            @08,33 say 'No existe matricula'
         endif
      else      
         wkey=str(wmatri,5)+wcateg
         select 2
         seek(wkey)
         if found()
            @08,25 SAY dctipo
            @08,29 say dcnro
            wkey1=str(dctipo,1)+str(dcnro,8)
            select 1
            seek(wkey1)
            if found()
               wdcto=b.dcnro
               wdctipo=b.dctipo
               @08,39 say nombre
               @23,01 say 'Indique el nuevo n£mero o <ESC> para salir'
               @10,25 get wdctipo pict '9'
               @10,29 get wdcto pict '99999999'
               read
               @23,01 clear to 23,78
               if lastkey()<>27
                  wop=1
                  @23,30 get wop pict '@*H \<Salir;\<Modificar' size 1,1
                  read
                  if wop=2
                     do modifica
                  endif   
               endif
            else
               @08,33 say 'Sin datos personales'
            endif           
         else
            @08,33 say 'No existe matricula'
         endif
      endif   
   else
      wsigue='N'
   endif   
enddo
close all
@04,01 clear to 23,78
return

procedure modifica
*wdctipo=dctipo
wnombre=nombre
wdomici=domici
wprovin=provin
wdpto=dpto
wlocali=locali
wnacio=nacio
wcuit=cuit
wsexo=sexo
westciv=estciv
wnacion=nacion
wtelef=telef
wtipo=tipo
wfallec=fallec
westado=estado
wdomleg=domleg
delete
append blank
replace dctipo with wdctipo
replace dcnro  with wdcto
replace nombre with wnombre
replace domici with wdomici
replace provin with wprovin
replace dpto   with wdpto
replace locali with wlocali
replace nacio  with wnacio
replace cuit   with wcuit
replace sexo   with wsexo
replace estciv with westciv
replace nacion with wnacion
replace telef  with wtelef
replace tipo   with wtipo
replace fallec with wfallec
replace estado with westado
replace domleg with wdomleg
@23,01 clear to 23,78
if wcateg = 'EM'
   select 4
   replace dctipo with wdctipo
   replace dcnro with wdcto
   return
else   
   select 2
   replace dctipo with wdctipo
   replace dcnro with wdcto
   return
endif
