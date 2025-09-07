procedure spjuac
*consulta de profesionales y alta en peritos Judiciales
@04,01 clear to 23,78
@04,28 say 'CONSULTA DE PROFESIONALES Y ALTAS EN PERITOS'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
select 7
use juprof index juprof
@06,01 say 'MATRICULA       CATEGORIA    '
@06,30 say 'NOMBRE: '
do while wsigue='S'
   wop=1
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(30)
         @06,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre del profesional'
         @06,38 get wnom pict '@!'
         read
         SELECT 1
         use spprof index spprofn
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for nombre =rtrim(wnom) in pnom
         deactivate window pnom 
         wkey=str(dctipo,1)+str(dcnro,8)
         WNOMBRE=NOMBRE
         select 2
         use spmatri index spmatdo
         seek(wkey)
         if found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
            do ver
         else
           @06,10 say 'Sin matr¡cula'   
         endif
      else
         if wop= 3
            @06,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @06,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @06,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               select 2
               use spmatri index spmatri
               seek(wkey2)
               if found()
                  wkey=str(dctipo,1)+str(dcnro,8)
                  select 1
                  use spprof index spprof
                  seek(wkey)
                  if found()
                     wnombre=nombre
                     select 2
                     do ver
                  else
                     @06,38 say 'Sin datos personales'
                  endif
               else
                  @06,10 say 'Sin matr¡cula'   
               endif
            else
            endif
         endif   
      endif          
   endif
enddo
*@04,01 clear to 23,78
close all
return

procedure ver
wkey2=str(wmatric,5)+wcatego
select 7
jumatr=wmatric
jucate=wcatego
wkey3=str(jumatr,5)+jucate
seek(wkey3)
if found()
   do muestra
endif   
@06,11 say wmatric pict '99999'
@06,27 say wcatego
@06,38 say wnombre
do panta11
*  se relaciona matri con titu para poner descrip.del titulo
select 3
use sptitu order titulo
select 2
set relation to titulo into sptitu            
wtitdesc=c.titdesc
wotorga=b.otorga
@07,17 say c.titulo
@07,21 say c.titdesc
@08,17 say b.habili
if b.condic < '2'
	@09,17 say "Activo "
else
   if b.condic = '2'
     @09,17 say "Carnet Depositado"
   else
     if b.condic = '3'
     	@09,17 say "Fallecido"
     else
        if b.condic = '04'
           @09,17 say "Suspendido"
        else
           if b.condic = '05'
              @09,17 say "Baja de Matricula"
           else
              @09,17 say "Inhabilitado otros motivos"
           endif
        endif
     endif
  endif
endif
wmatri=wmatric
wcateg=wcatego
save screen to panta11
do buscasan with wmatri, wcateg                    	  	
restore screen from panta11
select 5
use spcursos index spcursos
select 6
use spdescur order curso
select 5
seek(wkey2)
wcurso=space(2)
if found()
   @17,18 say e.curso
   wcurso=e.curso
   select 6
   seek(e.curso)
   if found()
      @17,23 say descrip
   else
      @17,23 say "sin descripcion"
   endif
endif
wop=0
@23,01 get wop picture "@*H \<Salir;\<Modificar;\<Ingresar" size 1,1 
read
@23,01 clear to 23,78
if wop=1
   wsigue='N'
else
   if wop = 2
      do modi
   else
      if wop = 3
         do ingresa
      endif
   endif
endif         
return


procedure panta11
@07,01 clear to 23,78
@07,02 say "T¡tulo      :"
@08,02 say "Habilitado  :"
@09,02 say "Estado      :"
@09,48 say "Situacion"
@09,60 say "Circuncrip. :"
@10,02 say "Especialidades:"
@17,02 say "Cursos      :"
return

procedure ingresa
wsigg='s'
wsena=0
wjuesp=space(3)
wjuespd=space(30)
wind=1
wlin=10
wop1=0
*do while wsigg='s'
   wesp1='   '
   wesp2='   '
   wesp3='   '
   wesp4='   '
   wesp5='   '
   wesp6='   '
   wcirc1=' ' 
   wcirc2=' '
   wcirc3=' ' 
   wcirc4=' ' 
   wcirc5=' ' 
   wcirc6=' '
   wcirc11=' ' 
   wcirc21=' '
   wcirc31=' ' 
   wcirc41=' '
   wcirc51=' ' 
   wcirc61=' '
   wcirc12=' ' 
   wcirc22=' '
   wcirc32=' ' 
   wcirc42=' '
   wcirc52=' ' 
   wcirc62=' '
   wcirc13=' ' 
   wcirc23=' '
   wcirc33=' ' 
   wcirc43=' '
   wcirc53=' ' 
   wcirc63=' '
   west1=' '
   west2=' '
   west3=' '
   west4=' '
   west5=' '
   west6=' '
*   @23,01 say 'Esc para salir'
*   @23,76 get wop1
*   read
   WJUESP=SPACE(3)
   westa=space(1)
*   if lastkey()<>27
*      if wjuesp<>'999'
   DO WHILE wjuesp<>'999'
      @23,01 clear to 23,78
      @23,01 say 'Ingrese especialidad 999 para terminar, <   > para buscar por nombre'
      @wlin,17 get wjuesp
      read
      if wjuesp<>'999'
         if wjuesp='   '
            SELECT 7
            use spjuti order tijunom
            @23,01 say 'Seleccione una especialidad y oprima <ESC>'
            define window ptit from 09,30 to 20,65 title 'Especialidades'
            activate window ptit
            brow fields tijunom nomodify in window ptit
            deactivate window ptit
            wjuesp=tijunum
            wjuespd=tijunom
            @WLIN,21 SAY wjuespd
            do titusitu
            @WLIN,50 GET westa
            read
            @20,01 clear to 23,78
         else
            SELECT 7
            use spjuti order tijunum
            seek(wjuesp)
            if found()
               wjuespd=tijunom
               @wlin,17 say wjuesp
               @wlin,21 say wjuespd
               do titusitu
               @wlin,50 get westa
               READ
               @20,01 clear to 23,78
            else
               @wlin,21 say 'no existe especialidad '
               exit   
            endif
         endif
         if wind=1
            wesp1=wjuesp
            west1=westa
            @23,01 clear to 23,78
            @wlin,59 get wcirc1
            @wlin,61 get wcirc11
            @wlin,63 get wcirc12
            @wlin,65 get wcirc13
            READ
         else
         	if wind=2
         	   wesp2=wjuesp
         	   west2=westa
               @wlin,59 get wcirc2
               @wlin,61 get wcirc21
               @wlin,63 get wcirc22
               @wlin,65 get wcirc23
               READ
         	else
         	   if wind =3
         	      wesp3 = wjuesp
         	      west3 = westa
                  @wlin,59 get wcirc3
                  @wlin,61 get wcirc31
                  @wlin,63 get wcirc32
                  @wlin,65 get wcirc33
                  READ
         	   else
         	      if wind = 4
         	         wesp4 = wjuesp
         	         west4 = westa
                     @wlin,59 get wcirc4
                     @wlin,61 get wcirc41
                     @wlin,63 get wcirc42
                     @wlin,65 get wcirc43
                     READ
         	      else
         	         if wind = 5
         	            wesp5=wjuesp
         	            west5 = westa
                        @wlin,59 get wcirc5
                        @wlin,61 get wcirc51
                        @wlin,63 get wcirc52
                        @wlin,65 get wcirc53
                        READ
         	         else
         	            wesp6=wjuesp
         	            west6 = westa
                        @wlin,59 get wcirc5
                        @wlin,61 get wcirc51
                        @wlin,63 get wcirc52
                        @wlin,65 get wcirc53
                        READ
         	         endif
         	      endif
         	   endif
         	endif
         endif
*      else
*         wsena=1
      endif            
      @wlin,17 say wjuesp
      @23,01 clear to 23,78
      wlin = wlin+1
      wind = wind+1
      enddo
*      if wind > 6 or wsena=1
wop3=0
@23,01 get wop3 picture "@*H \<Salir;\<Ingresar" size 1,1 
read
if wop3=2
         select 8
         use juprof index juprof
         append blank
         replace jumatr  with wmatric
         replace jucate  with wcatego
         replace jutit   with c.titulo
         replace junomb  with wnombre
         replace jucurs  with wcurso
         replace juesp1  with wesp1
         replace juesp2  with wesp2
         replace juesp3  with wesp3
         replace juesp4  with wesp4
         replace juesp5  with wesp5
         replace juesp6  with wesp6
         replace juhabi  with b.habili
         replace judomi  with a.domici
         replace juprov  with a.provin
         replace judpto  with a.dpto
         replace julocal with a.locali
         replace jucir1  with wcirc1
         replace jucir2  with wcirc2
         replace jucir3  with wcirc3
         replace jucir4  with wcirc4
         replace jucir5  with wcirc5
         replace jucir6  with wcirc6
         replace jucir11 with wcirc11
         replace jucir21 with wcirc21
         replace jucir31 with wcirc31
         replace jucir41 with wcirc41
         replace jucir51 with wcirc51
         replace jucir61 with wcirc61
         replace jucir12 with wcirc12
         replace jucir22 with wcirc22
         replace jucir32 with wcirc32
         replace jucir42 with wcirc42
         replace jucir52 with wcirc52
         replace jucir62 with wcirc62
         replace jucir13 with wcirc13
         replace jucir23 with wcirc23
         replace jucir33 with wcirc33
         replace jucir43 with wcirc43
         replace jucir53 with wcirc53
         replace jucir63 with wcirc63
         replace juest1  with west1
         replace juest2  with west2
         replace juest3  with west3
         replace juest4  with west4
         replace juest5  with west5
         replace juest6  with west6
      endif
*      if wsena = 1
*         wsigg='n'
*      endif          
*   else
*      wsigg='n'
*   endif   
*enddo
return   


procedure titusitu
@20,01 clear to 23,78
@20,01 say '1=Normal(Habilitado para ejercer especialidad -2=Hab.p/ejerc.prof pero no espec'
@21,01 say '3=Hab.profesion-No especialidad(falta curso)   4=No Habilitado(falta pago matr '
@22,01 say '5=No Habilitado (suspendido)                   6='
@23,01 say '7=No Inscripto en Consejo                        '
return

procedure muestra
return