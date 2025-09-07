procedure spdomic   
*parameter wkey
*actualizacion de datos domicilios
set exclusive off
wnom=space(30)
wkey=space(7)
wsigue='S'
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DATOS PUBLICAR / SUBS.FALLECIMIENTO'
do while wsigue='S'
   WOP=1
   @05,01 clear to 23,78
   @06,02 say 'Matr¡cula'
   @06,20 say 'Categ.:'
   @23,15 get wop pict '@*H \Salir;\<Por nombre;Por \<Matricula' size 1,1
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else
      if wop = 2
         wnom=space(30)
         @06,31 get wnom pict '@!'
         read
         select 1
         use spprof inde spprofn
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow fields nombre, domici for nombre=rtrim(wnom) in pnom
         deactivate window pnom
         wkey=str(dctipo,1)+str(dcnro,8)
         wnombre=nombre
         select 2
         use spmatri index spmatdo
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
            do proceder
            select 2
            continue
         enddo   
      else
         if wop=3 	
            wmatric=0
            @23,01 say 'Indique el Nro. de Matr¡cula o <esc> para salir'
            @06,13 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            wcatego=space(2)
            if lastkey()<>27
               @23,01 say 'Indique la Categor¡a'
               wcatego='A '
               @06,28 say wcatego pict '!!'
               wkey=str(wmatric,5)+wcatego
               select 2
               use spmatri index spmatri
               seek(wkey)
               if found()
                  wkey1=str(b.dctipo,1)+str(b.dcnro,8)
                  select 1
                  use spprof index spprof.idx, spprofn
                  seek(wkey1)
                  if found()
                     wnombre=nombre
                     do proceder
                  else
                     @07,31 say 'Sin datos personales'
                  endif
               else
                  @07,31 say 'No existe matricula'   
               endif   
            else
               @07,10 say 'Sin matricula '
            endif
         else
         endif
      endif
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure proceder
              @08,01 say 'Domicilio        :'
              @09,01 say 'Localidad        :'
              @09,40 say 'Dpto/Partido :'
              @10,01 say 'Provincia        :'
              @10,40 say 'Cod.Postal   :'
              @11,01 say 'Tel‚fono         :'
              @11,40 say 'Celular      :'
              @12,01 say 'e-mail           :'
              @13,40 SAY 'Estado Domic.:'
              @14,01 say 'Publicar: si=2 no=1 sin opciones=0 '
              @15,01 say 'Domicilio        :'
              @16,01 say 'Telefono         :'
              @16,23 say 'Celular:'
              @17,01 say 'email            :'
              @17,40 say 'Fecha autorizacion: '
              @19,01 say 'Subsidio Fallecimiento '
              @20,01 say 'Realiz¢ Tr mite  :'
              @20,24 say ' si=1, no=0 '
              @20,40 say 'Fecha             :'
              @06,31 say wnombre
		      @06,13 say wmatric pict '99999'
		      @06,28 say wcatego
              select 4
              use splocal order cod
              seek(str(a.locali,3))
              if found()
                 wlocalidad=nombre
              else
                 wlocalidad=space(15)
              endif      
              select 4
              use spdpto order dpto
              seek(str(a.dpto,3))
              if found()
                 wdepartamento=nombre
              else
                 wdepartamento=space(15)
              endif
              select 4
              use spprov order prov
              seek(a.provin)
              if found()
                 wprovincia=nombre
              else
                 wprovincia=space(15)
              endif            
              select 1
              @08,21 say domici
              @09,21 say locali pict '999'
              @09,25 say wlocalidad
              @09,56 say dpto pict '999'
              @09,59 say wdepartamento
              @10,22 say provin pict '99'
              @10,25 say wprovincia
              @10,56 say spcpos
              @11,21 say telef
              @11,56 say celular
              @12,21 say spemail
              @13,55 say tipo pict '9'
              @15,21 say vdom pict '9'
              @16,21 say vtelef pict '9'
              @16,32 say vcelu  pict '9'
              @17,21 say vmail  pict '9'
              @17,60 say vfecha
              @20,21 say vsubfa pict '9'
              @20,60 say vsubfe
              westadi=0
              westadu=space(1)
              wop2=0
              @23,01 clear to 23,78
              @23,20 get wop2 picture '@*H \<Modificar;\<Salir';
                    size 1,1 
              read
              @23,01 clear to 23,78
              if wop2=2
                 @07,01 clear to 23,78
                 wsigue='N'
              else
                 if wop2=1
                    do modi
                 endif      
              endif
@07,01 clear to 23,78   
return

procedure modi
wdom=vdom
wtelef=vtelef
wcelu=vcelu
wemail=vmail
wfecha=vfecha
wsubfa=vsubfa
wsubfe=vsubfe
wcpost=spcpos
@23,01 clear to 23,78
   @15,21 get wdom pict '9'   
   @16,21 get wtelef pict '9'
   @16,32 get wcelu pict '9'
   @17,21 get wemail pict '9'
   @17,60 get wfecha
   @20,21 get wsubfa pict '9'
   @20,60 get wsubfe
   read
select 1
replace vdom     with wdom
if wdom = 2
	replace vlocal   with 2
	replace vdpto  	 with 2
	replace vprov    with 2
else
	if wdom = 1
	   replace vlocal   with 1
	   replace vdpto  	with 1
	   replace vprov    with 1
	else
	   replace vlocal   with 0
	   replace vdpto  	with 0
	   replace vprov    with 0
	endif   
	
endif	
replace vtelef   with wtelef
replace vcelu    with wcelu
replace vmail    with wemail
replace vfecha   with wfecha
replace vsubfa   with wsubfa
replace vsubfe   with wsubfe
return

