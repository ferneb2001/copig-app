procedure spjuac1
*consulta de profesionales y alta en peritos Judiciales
@03,01 clear to 23,78
@03,28 say 'CONSULTA DE PROFESIONALES Y ALTAS EN PERITOS'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
select 7
use juprof index juproi
go top
@04,01 say 'MATRICULA       CATEGORIA    '
@04,30 say 'NOMBRE: '
do while wsigue='S'
   wop=1
   @04,01 clear to 23,78
   @04,01 say 'MATRICULA       CATEGORIA    '
   @04,30 say 'NOMBRE: '
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(30)
         @04,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre del profesional'
         @04,38 get wnom pict '@!'
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
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
*         seek(wkey)
*         if found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
            do ver
            select 2
            continue
         enddo   
*         else
*           @04,10 say 'Sin matr¡cula'   
*         endif
      else
         if wop= 3
            @04,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @04,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @04,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               select 2
               use spmatri index spmatri
               seek(wkey2)
               if found()
                  wkey=str(dctipo,1)+str(dcnro,8)
                  select 1
                  use spprof index spprof.idx
                  seek(wkey)
                  if found()
                     wnombre=nombre
                     select 2
                     do ver
                  else
                     @04,38 say 'Sin datos personales'
                  endif
               else
                  @04,10 say 'Sin matr¡cula'   
               endif
            else
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ver
wkey2=str(wmatric,5)+wcatego
@04,11 say wmatric pict '99999'
@04,27 say wcatego
@04,38 say wnombre
do panta11
*  se relaciona matri con titu para poner descrip.del titulo
select 3
use sptitu order titulo
select 2
set relation to titulo into sptitu            
wtitdesc=c.titdesc
wotorga=b.otorga
@05,17 say c.titulo
@05,21 say c.titdesc
@06,17 say b.habili
if b.condic < '2'
	@07,17 say "Activo "
else
   if b.condic = '2'
     @07,17 say "Carnet Depositado"
   else
     if b.condic = '3'
     	@07,17 say "Fallecido"
     else
        if b.condic = '04'
           @07,17 say "Suspendido"
        else
           if b.condic = '05'
              @07,17 say "Baja de Matricula"
           else
              @07,17 say "Inhabilitado otros motivos"
           endif
        endif
     endif
  endif
endif
wmatri=wmatric
wcateg=wcatego
*save screen to panta11
*do buscasan with wmatri, wcateg
*do buscarst with wmatri, wcateg                    	  	
*restore screen from panta11
select 5
use spcursos index spcursos.idx
select 6
use spdescur order curso
select 5
seek(wkey2)
wcurso=space(2)
if found()
   @06,42 say e.curso
   wcurso=e.curso
   select 6
   seek(e.curso)
   if found()
      @06,45 say descrip
   else
      @06,45 say "sin descripcion"
   endif
endif
wsiga='S'
wjuesp=space(3)
wjuespd=space(30)
wind=1
wlin=10
select 7
seek(wkey2)
do while found()
   do while wkey2=str(jumatr,5)+jucate
      @wlin,3 say juesp
      @wlin,51 say jucirc
      @wlin,65 say juesta
      wjuesp=juesp
      SELECT 8
      use spjuti order tijunum
      seek(wjuesp)
      if found()
         wjuespd=tijunom
         @wlin,10 say wjuespd
      else
         @wlin,10 say 'Sin descripcion de especialidad'
      endif
      select 7      
      wop=0
      @23,01 get wop pict "@*H \<Continuar;\<Eliminar;\<Modificar" size 1,1 
      read
      @23,01 clear to 23,78
      if wop = 2
         delete 
      else
         if wop = 3
            do modiju
         endif
      endif
      if wlin < 17
      	 wlin=wlin+1
      else
         @23,01 clear to 23,78
         @23,01 say 'Oprima cualquier tecla para continuar'	 
         read
         wlin=10
         @10,01 clear to 23,78
      endif
      skip   
   enddo
   exit   
enddo  
do while wsiga='S'
   wjuesp=space(3)
   wjucir=' '
   wjuesta=' '
   @23,01 say 'Ingrese especialidad 999 para terminar, <   > para buscar por nombre'
   @wlin,03 get wjuesp
   read
   if wjuesp<>'999'
      if wjuesp='   '
         SELECT 8
         use spjuti order tijunom
         @23,01 say 'Seleccione una especialidad y oprima <ESC>'
         define window ptit from 10,30 to 20,65 title 'Especialidades'
         activate window ptit
         brow fields tijunom nomodify in window ptit
         deactivate window ptit
         wjuesp=tijunum
         wjuespd=tijunom
         @wlin,03 say wjuesp
         @WLIN,10 SAY wjuespd
         @wlin,51 get wjucir
         do titusitu
         @WLIN,65 GET wjuesta
         read
         @17,01 clear to 23,78
         wop3=2
         @23,01 get wop3 pict '@*H \<salir;\<grabar' size 1,1
         read
         if wop3=2
            do graba
         endif   
      else
         SELECT 8
         use spjuti order tijunum
         seek(wjuesp)
         if found()
            wjuespd=tijunom
            @wlin,03 say wjuesp
            @wlin,10 say wjuespd
            @wlin,51 get wjucir
            do titusitu
            @wlin,65 get wjuesta
            READ
            @17,01 clear to 23,78
            wop3=2
            @23,01 get wop3 pict '@*H \<salir;\<grabar' size 1,1
            read
            if wop3=2
               do graba
            endif   
         else
            @wlin,21 say 'no existe especialidad '
            exit   
         endif
      endif
      select 7   
      IF WLIN<17
         WLIN=WLIN+1
      ELSE
         @23,01 SAY 'Oprima cualquier tecla para continuar'
         read
         wlin=10
         @10,01 clear to 23,78
      endif
   else
      wsiga ='N'   	
   endif
enddo            
return


procedure panta11
@05,01 clear to 23,78
@05,02 say "T¡tulo      :"
@06,02 say "Habilitado  :"
@07,02 say "Estado      :"
@08,55 say "Situacion"
@08,43 say "Circuncrip. :"
@08,02 say "Especialidades:"
@06,35 say "Cursos      :"
return

procedure graba
select 7
 append blank
 replace jumatr  with wmatric
 replace jucate  with wcatego
 replace juesp   with wjuesp  
 replace jucirc   with wjucir 
 replace juesta  with wjuesta
return


procedure modiju
wjuesp=juesp
wjucir=jucirc
wjuesta=juesta
SELECT 8
use spjuti order tijunum
seek(wjuesp)
if found()
   wjuespd=tijunom
   @wlin,10 say wjuespd
else
   @wlin,21 say 'no existe especialidad '
endif
select 7
@23,01 say 'Ingrese los datos a modificar '
do titusitu
@wlin,02 get wjuesp
@wlin,51 get wjucir
@wlin,65 get wjuesta
read
replace juesp with wjuesp
replace jucirc with wjucir
replace juesta with wjuesta
@23,01 clear to 23,78
return
 

procedure titusitu
@16,01 clear to 23,78
@16,01 say '1=Normal(Habilitado para ejercer especialidad' 
@17,01 say '2=Hab.p/ejerc.prof pero no espec'
@18,01 say '3=Hab.profesion-No especialidad(falta curso)'  
@19,01 say '4=No Habilitado(falta pago matr '
@20,01 say '5=No Habilitado (carnet depositado)               '  
@21,01 say '6=No hay antecedentes de T¡tulo o Especialidad en Consejo' 
@22,01 say '7=No Inscripto en Consejo                        '
@23,01 say '8=No Hab.(falta pago mat.) y no hab. ejercer especialidad'
return

procedure buscarst
parameter  wmatric, wcateg
select 9
use sprestri index sprestri
@23,01 clear to 23,78
@23,01 say 'Oprima <ESC> para salir'
define window prest from 10,05 to 22,75 title 'Restricciones'
activate window prest
browse fields restrtipo:H='Tipo',observac:H='Observ.',restforig:H='F.Orig.',restimpo:H='Importe',;
			  restfactu:H='F.Vto.',restfpago:H='F.Pago';
		for matric=wmatric and catego=wcateg and restrotr = 0 in prest
deactivate window prest
@23,01 clear to 23,78
return		
